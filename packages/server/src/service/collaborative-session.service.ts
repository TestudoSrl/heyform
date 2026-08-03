import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { createHash } from 'crypto'
import { Model } from 'mongoose'

import { CollaborativeSessionModel } from '../model/collaborative-session.model'
import { FormModel } from '../model/form.model'
import { flattenFields } from '@heyform-inc/answer-utils'
import { timestamp } from '@heyform-inc/utils'

const PARTICIPANT_ACTIVE_WINDOW_SECONDS = 10

@Injectable()
export class CollaborativeSessionService {
  constructor(
    @InjectModel(CollaborativeSessionModel.name)
    private readonly collaborativeSessionModel: Model<CollaborativeSessionModel>
  ) {}

  async create(formId: string): Promise<CollaborativeSessionModel> {
    return this.collaborativeSessionModel.create({ formId })
  }

  async findByToken(token: string): Promise<CollaborativeSessionModel | null> {
    return this.collaborativeSessionModel.findById(token)
  }

  async touch(token: string, participantId: string): Promise<CollaborativeSessionModel | null> {
    return this.collaborativeSessionModel.findOneAndUpdate(
      {
        _id: token,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          [`participants.${this.participantKey(participantId)}`]: timestamp()
        }
      },
      { new: true }
    )
  }

  activeParticipantCount(
    session: CollaborativeSessionModel,
    currentTimestamp = timestamp()
  ): number {
    return Object.values(session.participants || {}).filter(
      lastSeenAt => Number(lastSeenAt) >= currentTimestamp - PARTICIPANT_ACTIVE_WINDOW_SECONDS
    ).length
  }

  async findActive(token: string, formId: string): Promise<CollaborativeSessionModel | null> {
    return this.collaborativeSessionModel.findOne({
      _id: token,
      formId,
      completedAt: 0,
      expiresAt: { $gt: new Date() }
    })
  }

  async update(
    token: string,
    form: FormModel,
    changes: Record<string, any>,
    participantId?: string
  ): Promise<CollaborativeSessionModel> {
    const fieldIds = new Set(flattenFields(form.fields || [], true).map(field => field.id))
    const entries = Object.entries(changes || {}).filter(([fieldId]) => fieldIds.has(fieldId))

    if (entries.length < 1) {
      const session = await this.findActive(token, form.id)

      if (!session) {
        throw new BadRequestException('The shared response is no longer active')
      }

      return session
    }

    const $set: Record<string, any> = {}
    const $unset: Record<string, 1> = {}

    for (const [fieldId, value] of entries) {
      if (value === null || typeof value === 'undefined') {
        $unset[`values.${fieldId}`] = 1
      } else {
        $set[`values.${fieldId}`] = value
      }
    }

    if (participantId) {
      $set[`participants.${this.participantKey(participantId)}`] = timestamp()
    }

    const update: Record<string, any> = { $inc: { revision: 1 } }

    if (Object.keys($set).length > 0) {
      update.$set = $set
    }

    if (Object.keys($unset).length > 0) {
      update.$unset = $unset
    }

    const session = await this.collaborativeSessionModel.findOneAndUpdate(
      {
        _id: token,
        formId: form.id,
        completedAt: 0,
        expiresAt: { $gt: new Date() }
      },
      update,
      { new: true }
    )

    if (!session) {
      throw new BadRequestException('The shared response is no longer active')
    }

    return session
  }

  async claim(
    token: string,
    formId: string,
    revision: number
  ): Promise<CollaborativeSessionModel | null> {
    return this.collaborativeSessionModel.findOneAndUpdate(
      {
        _id: token,
        formId,
        revision,
        completedAt: 0,
        expiresAt: { $gt: new Date() }
      },
      { $set: { completedAt: timestamp() } },
      { new: true }
    )
  }

  private participantKey(participantId: string): string {
    return createHash('sha256').update(participantId).digest('hex')
  }
}
