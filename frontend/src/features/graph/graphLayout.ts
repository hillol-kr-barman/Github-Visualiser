import type { Edge, Node } from '@xyflow/react'
import type { CommitGraph, CommitGraphNode } from './types'

export type CommitNodeData = CommitGraphNode
export type CommitFlowNode = Node<CommitNodeData, 'commit'>

export function toReactFlowGraph(graph: CommitGraph): {
  nodes: CommitFlowNode[]
  edges: Edge[]
} {
  return {
    nodes: graph.nodes.map((commit, index) => ({
      id: commit.sha,
      type: 'commit',
      data: commit,
      position: { x: 120, y: index * 150 },
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: false,
      type: 'smoothstep',
      style: { stroke: '#38bdf8', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: '#38bdf8' },
    })),
  }
}
