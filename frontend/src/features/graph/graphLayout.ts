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
      position: { x: index * 220, y: (index % 4) * 140 },
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: false,
    })),
  }
}
