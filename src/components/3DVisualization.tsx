import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useState } from 'react';
import type { PlacementResult, PlacedPart, Machine, MachineAllocation } from '../types';
import * as THREE from 'three';

interface ThreeDVisualizationProps {
    result: PlacementResult | null;
}

// Modern vibrant color palette for jobs
const JOB_COLORS = [
    '#3B82F6', // Bright Blue (İş 1)
    '#8B5CF6', // Vibrant Purple (İş 2)
    '#EC4899', // Hot Pink (İş 3)
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
];

interface PartBoxProps {
    part: PlacedPart;
    jobColor: string;
}

function PartBox({ part, jobColor }: PartBoxProps) {
    const [hovered, setHovered] = useState(false);

    // Calculate label font size - bigger and more readable
    const minDim = Math.min(part.width, part.depth, part.height);
    const labelSize = Math.max(minDim * 0.6, 2); // Minimum 2, scaled by smallest dimension

    return (
        <group
            position={[
                part.x + part.width / 2,
                part.z + part.height / 2,
                part.y + part.depth / 2
            ]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }}
        >
            {/* 3D Box */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[part.width, part.height, part.depth]} />
                <meshStandardMaterial
                    color={jobColor}
                    metalness={0.1}
                    roughness={0.5}
                    emissive={jobColor}
                    emissiveIntensity={hovered ? 0.5 : 0.15}
                />
            </mesh>

            {/* White edges for better visibility */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(part.width, part.height, part.depth)]} />
                <lineBasicMaterial color="#ffffff" opacity={hovered ? 1 : 0.6} transparent linewidth={2} />
            </lineSegments>

            {/* Part number label - CENTERED IN BOX */}
            <Text
                position={[0, 0, 0]} // Center of the box
                fontSize={labelSize}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={labelSize * 0.08}
                outlineColor="#000000"
                fontWeight="bold"
            >
                {part.parca}
            </Text>

            {/* Background panel for label - makes it more readable */}
            <mesh position={[0, 0, part.depth / 2 + 0.05]}>
                <planeGeometry args={[labelSize * 1.8, labelSize * 1.2]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* Detailed info on hover */}
            {hovered && (
                <Html center distanceFactor={8}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.95)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                        border: `3px solid ${jobColor}`,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '16px', marginBottom: '6px' }}>📦 Parça {part.parca}</div>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>
                            Boyut: {part.width} × {part.depth} × {part.height}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            Pozisyon: ({part.x}, {part.y}, {part.z})
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

interface MachineBoxProps {
    machine: Machine;
    machineAlloc: MachineAllocation;
}

function MachineBox({ machine, machineAlloc }: MachineBoxProps) {
    return (
        <group>
            {/* Machine wireframe box */}
            <mesh position={[machine.xKen / 2, machine.maxYukseklik / 2, machine.yKenar / 2]}>
                <boxGeometry args={[machine.xKen, machine.maxYukseklik, machine.yKenar]} />
                <meshBasicMaterial
                    color="#6b7280"
                    transparent
                    opacity={0.12}
                    wireframe
                />
            </mesh>

            {/* Floor grid */}
            <gridHelper
                args={[Math.max(machine.xKen, machine.yKenar), 10, '#4b5563', '#1f2937']}
                position={[machine.xKen / 2, 0, machine.yKenar / 2]}
            />

            {/* Machine base platform */}
            <mesh position={[machine.xKen / 2, 0.08, machine.yKenar / 2]} receiveShadow>
                <boxGeometry args={[machine.xKen, 0.16, machine.yKenar]} />
                <meshStandardMaterial
                    color="#111827"
                    metalness={0.95}
                    roughness={0.1}
                />
            </mesh>

            {/* Machine label at top - LARGER AND MORE VISIBLE */}
            <Text
                position={[machine.xKen / 2, machine.maxYukseklik + 4, machine.yKenar / 2]}
                fontSize={3.5}
                color="#3b82f6"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.3}
                outlineColor="#000000"
                fontWeight="bold"
            >
                Makine {machine.id}
            </Text>

            {/* Machine dimensions - LARGER */}
            <Text
                position={[machine.xKen / 2, -2, -3]}
                fontSize={1.8}
                color="#9ca3af"
                anchorX="center"
                outlineWidth={0.1}
                outlineColor="#000000"
            >
                {machine.xKen} × {machine.yKenar} × {machine.maxYukseklik}
            </Text>

            {/* Stats at bottom - LARGER AND MORE VIBRANT */}
            <Text
                position={[machine.xKen / 2, -4, -3]}
                fontSize={1.5}
                color="#10b981"
                anchorX="center"
                fontWeight="bold"
                outlineWidth={0.1}
                outlineColor="#000000"
            >
                {machineAlloc.placedParts.length} parça
            </Text>
        </group>
    );
}

interface JobScene3DProps {
    job: PlacementResult['jobs'][0];
    jobColor: string;
}

function JobScene3D({ job, jobColor }: JobScene3DProps) {
    const maxDimension = Math.max(
        ...job.machines.map(m => Math.max(m.machine.xKen, m.machine.yKenar, m.machine.maxYukseklik))
    );

    return (
        <>
            {/* Enhanced Lighting for better visibility */}
            <ambientLight intensity={0.7} />
            <directionalLight
                position={[50, 70, 50]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={200}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
            <directionalLight position={[-50, 50, -50]} intensity={0.6} />
            <pointLight position={[0, maxDimension * 1.2, 0]} intensity={0.5} color="#ffffff" />

            {/* Camera Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={maxDimension * 0.8}
                maxDistance={maxDimension * 4}
                autoRotate={false}
            />

            {/* Axis indicators - LARGER AND MORE VISIBLE */}
            <group position={[-8, 0, -8]}>
                <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 8, 0xff6b6b, 2, 1.5]} />
                <Text position={[9, 0, 0]} fontSize={2.5} color="#ff6b6b" fontWeight="bold" outlineWidth={0.2} outlineColor="#000000">X</Text>

                <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 8, 0x4ecdc4, 2, 1.5]} />
                <Text position={[0, 9, 0]} fontSize={2.5} color="#4ecdc4" fontWeight="bold" outlineWidth={0.2} outlineColor="#000000">Y</Text>

                <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 8, 0x45b7d1, 2, 1.5]} />
                <Text position={[0, 0, 9]} fontSize={2.5} color="#45b7d1" fontWeight="bold" outlineWidth={0.2} outlineColor="#000000">Z</Text>
            </group>

            {/* Render machines */}
            {job.machines.map((machineAlloc, machineIdx) => {
                const machine = machineAlloc.machine;
                const gridX = (machineIdx % 3) * (maxDimension * 1.8);
                const gridZ = Math.floor(machineIdx / 3) * (maxDimension * 1.8);

                return (
                    <group key={machineIdx} position={[gridX, 0, gridZ]}>
                        <MachineBox machine={machine} machineAlloc={machineAlloc} />

                        {/* Placed parts */}
                        {machineAlloc.placedParts.map((part, partIdx) => (
                            <PartBox
                                key={partIdx}
                                part={part}
                                jobColor={jobColor}
                            />
                        ))}
                    </group>
                );
            })}
        </>
    );
}

export function ThreeDVisualization({ result }: ThreeDVisualizationProps) {
    const [selectedJobIndex, setSelectedJobIndex] = useState(0);

    if (!result) {
        return (
            <div className="visualization-3d empty">
                <p>🎨 3D Görselleştirme için optimizasyon yapın</p>
            </div>
        );
    }

    const selectedJob = result.jobs[selectedJobIndex];
    const jobColor = JOB_COLORS[selectedJobIndex % JOB_COLORS.length];

    // Calculate camera position based on job size
    const maxDimension = Math.max(
        ...selectedJob.machines.map(m => Math.max(m.machine.xKen, m.machine.yKenar, m.machine.maxYukseklik))
    );
    const cameraDistance = maxDimension * 2;

    return (
        <div className="visualization-3d">
            <div className="visualization-header">
                <h2>🎨 3D Yerleşim Görselleştirmesi</h2>
                <div className="controls-info">
                    <span>🖱️ Döndür: Sol Tıklama</span>
                    <span>🔍 Zoom: Kaydır</span>
                    <span>↔️ Pan: Sağ Tıklama</span>
                </div>
            </div>

            {/* Job Selector Tabs */}
            {result.jobs.length > 1 && (
                <div className="job-selector">
                    {result.jobs.map((job, idx) => (
                        <button
                            key={job.jobId}
                            className={`job-tab ${selectedJobIndex === idx ? 'active' : ''}`}
                            onClick={() => setSelectedJobIndex(idx)}
                            style={{
                                borderColor: selectedJobIndex === idx ? JOB_COLORS[idx % JOB_COLORS.length] : 'transparent',
                                backgroundColor: selectedJobIndex === idx ? JOB_COLORS[idx % JOB_COLORS.length] : 'transparent',
                            }}
                        >
                            İş {job.jobId}
                        </button>
                    ))}
                </div>
            )}

            {/* 3D Canvas */}
            <div className="canvas-container">
                <Canvas
                    key={selectedJobIndex} // Force re-render on job change
                    camera={{
                        position: [cameraDistance, cameraDistance * 0.8, cameraDistance],
                        fov: 50,
                    }}
                    shadows
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                        borderRadius: '12px',
                    }}
                >
                    <JobScene3D job={selectedJob} jobColor={jobColor} />
                </Canvas>
            </div>

            {/* Job Info */}
            <div className="job-info-3d">
                <div className="info-item">
                    <span className="info-label">İş:</span>
                    <span className="info-value" style={{ color: jobColor }}>İş {selectedJob.jobId}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Makine Sayısı:</span>
                    <span className="info-value">{selectedJob.machines.length}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Toplam Parça:</span>
                    <span className="info-value">
                        {selectedJob.machines.reduce((sum, m) => sum + m.placedParts.length, 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}
