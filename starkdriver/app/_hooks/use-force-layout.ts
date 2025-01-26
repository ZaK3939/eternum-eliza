import { useEffect, useRef, useMemo } from 'react';

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';

import {
  useReactFlow,
  ReactFlowProps,
  ReactFlowState,
  useStore,
  Node,
  useNodesInitialized,
} from '@xyflow/react';

type UseForceLayoutOptions = {
  strength: number;
  distance: number;
  oscillationStrength?: number;
};

type SimNodeType = SimulationNodeDatum & Node;
type SimEdgeType = SimulationLinkDatum<SimNodeType>;

type DragEvents = {
  start: ReactFlowProps['onNodeDragStart'];
  drag: ReactFlowProps['onNodeDrag'];
  stop: ReactFlowProps['onNodeDragStop'];
};

const elementCountSelector = (state: ReactFlowState) =>
  state.nodeLookup.size + state.edges.length;

function useForceLayout({
  strength = -2000,
  distance = 10000,
  oscillationStrength = 1,
}: UseForceLayoutOptions) {
  const elementCount = useStore(elementCountSelector);
  const nodesInitialized = useNodesInitialized();
  const { setNodes, getNodes, getEdges } = useReactFlow();
  
  const draggingNodeRef = useRef<null | Node>(null);
  const dragEvents = useMemo<DragEvents>(
    () => ({
      start: (_event, node) => (draggingNodeRef.current = node),
      drag: (_event, node) => (draggingNodeRef.current = node),
      stop: () => (draggingNodeRef.current = null),
    }),
    []
  );

  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (!nodes.length || !nodesInitialized) {
      return;
    }

    const simulationNodes: SimNodeType[] = nodes.map((node) => ({
      ...node,
      x: node.position.x ?? 0,
      y: node.position.y ?? 0,
    }));

    const simulationLinks: SimEdgeType[] = edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target
    }));

    const simulation = forceSimulation<SimNodeType>()
      .nodes(simulationNodes)
      .force('charge', forceManyBody().strength(strength))
      .force(
        'link',
        forceLink<SimNodeType, SimEdgeType>(simulationLinks)
          .id((d) => d.id)
          .strength(0.05)
          .distance(distance)
      )
      .force('x', forceX().x(0).strength(0.01))
      .force('y', forceY().y(0).strength(0.01))
      .on('tick', () => {
        setNodes((nodes) =>
          nodes.map((node, i) => {
            if (simulationNodes[i]) {
              const x = simulationNodes[i].x ?? node.position.x ?? 0;
              const y = simulationNodes[i].y ?? node.position.y ?? 0;
              const dragging = draggingNodeRef.current?.id === node.id;

              if (dragging) {
                simulationNodes[i].fx = node.position.x;
                simulationNodes[i].fy = node.position.y;
              } else {
                delete simulationNodes[i].fx;
                delete simulationNodes[i].fy;
              }

              return { ...node, position: { x, y } };
            }
            return node;
          })
        );
      });

    // Add a smooth oscillating force that changes periodically
    let timer: NodeJS.Timeout;
    const startTime = Date.now();
    
    const addOscillation = () => {
      const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
      
      simulationNodes.forEach((node) => {
        // Use node.id to create consistent but varying frequencies
        const seed = Array.from(node.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;
        
        // Combine three sine waves with different frequencies and phases
        const vx = (
          Math.sin(elapsed * 0.3 + seed) +
          Math.sin(elapsed * 0.7 + seed * 2) * 0.5 +
          Math.sin(elapsed * 1.1 + seed * 3) * 0.3
        ) * (oscillationStrength / 1.8); // Normalize the combined amplitude
        
        const vy = (
          Math.cos(elapsed * 0.4 + seed * 1.5) +
          Math.cos(elapsed * 0.8 + seed * 2.5) * 0.5 +
          Math.cos(elapsed * 1.2 + seed * 3.5) * 0.3
        ) * (oscillationStrength / 1.8);

        node.vx = vx;
        node.vy = vy;
      });
      
      simulation.alpha(0.1);
      simulation.restart();
      
      timer = setTimeout(addOscillation, 1000 / 60);
    };

    // Start the oscillation
    addOscillation();

    return () => {
      simulation.stop();
      clearTimeout(timer);
    };
  }, [
    elementCount,
    getNodes,
    getEdges,
    setNodes,
    strength,
    distance,
    nodesInitialized,
    oscillationStrength,
  ]);

  return dragEvents;
}

export default useForceLayout;
