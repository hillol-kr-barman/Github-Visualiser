import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { CommitGraphNode } from './types'

type CommitFlowNode = Node<CommitGraphNode, 'commit'>

function CommitNode({ data, selected }: NodeProps<CommitFlowNode>) {
  const author = data.author_name || data.author_login || 'Unknown author'

  return (
    <article
      className={`grid gap-[5px] min-w-[280px] max-w-[280px] p-[10px] rounded-[6px] border relative transition-colors ${
        selected
          ? 'bg-[rgba(0,212,220,0.08)] border-[rgba(0,212,220,0.6)] border-2'
          : 'bg-[rgba(22,26,30,0.95)] border-[rgba(255,255,255,0.07)] hover:border-[#00d4dc]'
      }`}
    >
      <Handle
        className="bg-[#00d4dc]! border-2! border-[#161a1e]! size-[10px]!"
        type="target"
        position={Position.Top}
      />
      <strong className="font-mono text-[10px] text-[rgba(0,212,220,0.8)] [overflow-wrap:anywhere]">
        {data.short_sha}
      </strong>
      <p className="text-[rgba(238,240,243,0.85)] font-medium text-[12px] leading-[1.45] m-0 line-clamp-3 [overflow-wrap:anywhere]">
        {data.message}
      </p>
      <p className="font-mono text-[9px] text-[rgba(107,118,133,0.9)] leading-[1.45] m-0 [overflow-wrap:anywhere]">
        {author}
      </p>
      {data.branch_labels.length > 0 ? (
        <div className="flex flex-wrap gap-[3px] mt-[2px]">
          {data.branch_labels.map((branch) => (
            <span
              key={branch}
              className="font-mono text-[9px] text-[rgba(0,212,220,0.9)] bg-[rgba(0,212,220,0.15)] border border-[rgba(0,212,220,0.3)] px-[5px] py-[1px] rounded-[3px]"
            >
              {branch}
            </span>
          ))}
        </div>
      ) : null}
      <Handle
        className="bg-[#00d4dc]! border-2! border-[#161a1e]! size-[10px]!"
        type="source"
        position={Position.Bottom}
      />
    </article>
  )
}

export default CommitNode
