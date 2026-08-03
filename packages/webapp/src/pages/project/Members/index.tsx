import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { WorkspaceService } from '@/services'
import { useParam } from '@/utils'

import { Async, Repeat } from '@/components'
import {
  ProjectJoinedMemberItem,
  ProjectRemainingMemberItem
} from '@/layouts/Project/ProjectMemberItem'
import { useUserStore, useWorkspaceStore } from '@/store'

const MemberSkeleton = () => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-4">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-24 rounded-sm" />
        <div className="skeleton h-3.5 w-40 rounded-sm" />
      </div>
    </div>
    <div className="skeleton h-9 w-20 rounded-md" />
  </div>
)

export default function ProjectMembers() {
  const { t } = useTranslation()
  const { workspaceId } = useParam()
  const { user } = useUserStore()
  const { workspace, project, members, setMembers } = useWorkspaceStore()

  const joined = useMemo(
    () =>
      members
        .filter(member => project?.members.includes(member.id))
        .map(member => ({
          ...member,
          isOwner: workspace.ownerId === member.id,
          isYou: user.id === member.id
        })),
    [members, project?.members, user.id, workspace.ownerId]
  )

  const remaining = useMemo(
    () => members.filter(member => !project?.members.includes(member.id)),
    [members, project?.members]
  )

  async function fetch() {
    setMembers(workspaceId, await WorkspaceService.members(workspaceId))
    return true
  }

  return (
    <div className="mt-6 max-w-3xl">
      <h2 className="text-lg font-semibold">{t('project.members.headline')}</h2>
      <p className="text-secondary mt-1 text-sm/6">
        <Trans
          t={t}
          i18nKey="project.members.subHeadline"
          components={{
            strong: <strong />
          }}
        />
      </p>

      <Async
        fetch={fetch}
        refreshDeps={[workspaceId]}
        loader={
          <div className="hf-card mt-6 divide-y divide-[#e5e7eb] px-5">
            <Repeat count={3}>
              <MemberSkeleton />
            </Repeat>
          </div>
        }
      >
        <div className="hf-card mt-6 divide-y divide-[#e5e7eb] px-5">
          {joined.map(member => (
            <ProjectJoinedMemberItem key={member.id} member={member} />
          ))}
        </div>

        {remaining.length > 0 && (
          <section className="mt-8">
            <h3 className="text-secondary text-sm font-medium">
              {t('project.members.unjoinedMembers')}
            </h3>
            <div className="hf-card mt-3 divide-y divide-[#e5e7eb] px-5">
              {remaining.map(member => (
                <ProjectRemainingMemberItem key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}
      </Async>
    </div>
  )
}
