import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { CommitGraphNode } from './types'

type CommitFlowNode = Node<CommitGraphNode, 'commit'>

function CommitNode({ data }: NodeProps<CommitFlowNode>) {
  const author = data.author_name || data.author_login || 'Unknown author'

  return (
    <article className="commit-node">
      <Handle className="commit-node__handle" type="target" position={Position.Bottom} />
      <strong className="commit-node__sha">{data.short_sha}</strong>
      <p className="commit-node__message">{data.message}</p>
      <p>{author}</p>
      {data.branch_labels.length > 0 ? (
        <div className="branch-labels">
          {data.branch_labels.map((branch) => (
            <span className="branch-label" key={branch}>
              {branch}
            </span>
          ))}
        </div>
      ) : null}
      <Handle className="commit-node__handle" type="source" position={Position.Top} />
    </article>
  )
}

export default CommitNode
