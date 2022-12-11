import { Box, Button } from '@chakra-ui/react'

import { useCallback } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow'
// 👇 you need to import the reactflow styles
import 'reactflow/dist/style.css'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

const defaultEdgeOptions = {
  animated: false,
  // type: 'smoothstep',
}

export default function Workflows() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  function handleClick() {
    setNodes([...nodes, { id: '3', position: { x: 100, y: 200 }, data: { label: '3' } }])
    setEdges([...edges, { id: 'e2-3', source: '2', target: '3' }])
  }

  return (
    <Box w='800px' h='800px' border='solid red 1px'>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        {/* <MiniMap /> */}
        <Controls />
        <Background />
      </ReactFlow>

      <Button onClick={handleClick}>Test</Button>
    </Box>
  )
}
