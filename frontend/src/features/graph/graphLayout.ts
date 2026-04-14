import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { CommitGraph, CommitGraphNode } from './types'

export type CommitNodeData = CommitGraphNode
export type CommitFlowNode = Node<CommitNodeData, 'commit'>

const edgeStyle = { stroke: '#38bdf8', strokeWidth: 2 }

function toFlowEdge(edge: { id: string; source: string; target: string }): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: false,
    type: 'smoothstep',
    style: edgeStyle,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  }
}

function timelineEdges(commits: CommitGraphNode[]): Edge[] {
  return commits.slice(0, -1).map((commit, index) =>
    toFlowEdge({
      id: `timeline-${commit.sha}-${commits[index + 1].sha}`,
      source: commit.sha,
      target: commits[index + 1].sha,
    }),
  )
}

export function toReactFlowGraph(graph: CommitGraph): {
  nodes: CommitFlowNode[]
  edges: Edge[]
} {
  const graphEdges = graph.edges.length > 0 ? graph.edges.map(toFlowEdge) : timelineEdges(graph.nodes)

  return {
    nodes: graph.nodes.map((commit, index) => ({
      id: commit.sha,
      type: 'commit',
      data: commit,
      position: { x: 120, y: index * 150 },
    })),
    edges: graphEdges,
  }
}
