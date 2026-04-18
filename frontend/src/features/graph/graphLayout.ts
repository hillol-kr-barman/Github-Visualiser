import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { CommitGraph, CommitGraphNode } from './types'

export type CommitNodeData = CommitGraphNode
export type CommitFlowNode = Node<CommitNodeData, 'commit'>

const edgeStyle = { stroke: '#04d9ff', strokeWidth: 2 }

function toFlowEdge(edge: { id: string; source: string; target: string }): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: false,
    type: 'smoothstep',
    style: edgeStyle,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#04d9ff' },
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

function firstParentEdges(commits: CommitGraphNode[]): Edge[] {
  const fetchedShas = new Set(commits.map((commit) => commit.sha))

  return commits.flatMap((commit) => {
    const firstFetchedParent = commit.parents.find((parentSha) => fetchedShas.has(parentSha))

    if (!firstFetchedParent) {
      return []
    }

    return toFlowEdge({
      id: `first-parent-${commit.sha}-${firstFetchedParent}`,
      source: commit.sha,
      target: firstFetchedParent,
    })
  })
}

export function toReactFlowGraph(graph: CommitGraph): {
  nodes: CommitFlowNode[]
  edges: Edge[]
} {
  const readableEdges = firstParentEdges(graph.nodes)
  const graphEdges = readableEdges.length > 0 ? readableEdges : timelineEdges(graph.nodes)

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
