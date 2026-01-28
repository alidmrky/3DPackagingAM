import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Text,
    PerspectiveCamera,
    Html,
    CameraControls
} from '@react-three/drei';
import type { PlacementLog, Machine, Part, PlacedPart, PlacementStep, PlacementAttempt } from '../types';
import * as THREE from 'three';

interface AlgorithmAnimationProps {
    placementLog: PlacementLog;
    machines: Machine[];
    parts: Part[];
}

// Job colors
const JOB_COLORS = [
    '#3B82F6', // Bright Blue (Job 1)
    '#8B5CF6', // Vibrant Purple (Job 2)
    '#EC4899', // Hot Pink (Job 3)
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#EF4444', // Red
    '#84CC16', // Lime
];

// Easing function for bounce effect
const easeOutBounce = (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

// Get current state at step
function getStateAtStep(
    steps: PlacementStep[],
    currentStep: number,
    allParts: Part[]
): { jobs: Map<number, Map<number, PlacedPart[]>>; jobCount: number } {
    const jobs: Map<number, Map<number, PlacedPart[]>> = new Map();
    let currentJobCount = 0;

    for (let i = 0; i <= currentStep; i++) {
        const step = steps[i];
        const placement = step.finalPlacement;

        if (placement) {
            const { jobId, machineId } = placement;

            if (!jobs.has(jobId)) {
                jobs.set(jobId, new Map());
            }

            const jobMachines = jobs.get(jobId)!;
            if (!jobMachines.has(machineId)) {
                jobMachines.set(machineId, []);
            }

            const part = allParts.find(p => p.parca === step.partId);
            if (part) {
                const placedPart: PlacedPart = {
                    parca: step.partId,
                    x: placement.position.x,
                    y: placement.position.y,
                    z: placement.position.z,
                    width: part.kenar1,
                    depth: part.kenar2,
                    height: part.yukseklik,
                };
                jobMachines.get(machineId)!.push(placedPart);
            }

            if (jobId > currentJobCount) {
                currentJobCount = jobId;
            }
        }
    }

    return { jobs, jobCount: currentJobCount };
}

// Memoized Part Box with animations
const AnimatedPart = memo(function AnimatedPart({
    part,
    jobColor,
    isNew = false,
    showGhost = false,
    onClick
}: {
    part: PlacedPart;
    jobColor: string;
    isNew?: boolean;
    showGhost?: boolean;
    onClick?: () => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [visible, setVisible] = useState(!isNew);
    const [opacity, setOpacity] = useState(isNew ? 0 : 1);
    const [scale, setScale] = useState(1);
    const [yOffset, setYOffset] = useState(isNew ? 100 : 0);

    // Animation refs
    const animationRef = useRef<{ startTime: number; duration: number; type: string } | null>(null);

    useEffect(() => {
        if (isNew) {
            setVisible(true);
            // Drop animation with bounce
            const startTime = Date.now();
            const duration = 800;

            animationRef.current = { startTime, duration, type: 'drop' };

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Drop with bounce easing
                const bounceProgress = easeOutBounce(progress);
                setYOffset(100 * (1 - bounceProgress));
                setOpacity(progress);

                // Scale bounce at end
                if (progress >= 0.8) {
                    const scaleProgress = (progress - 0.8) / 0.2;
                    const scaleBounce = 1 + Math.sin(scaleProgress * Math.PI) * 0.1;
                    setScale(scaleBounce);
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setScale(1);
                    setYOffset(0);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [isNew]);

    const minDim = Math.min(part.width, part.depth, part.height);
    const labelSize = Math.max(minDim * 0.5, 2);

    if (!visible) return null;

    return (
        <group
            position={[
                part.x + part.width / 2,
                part.z + part.height / 2 + yOffset,
                part.y + part.depth / 2
            ]}
            scale={[scale, scale, scale]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
                document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {/* Ghost preview */}
            {showGhost && (
                <mesh>
                    <boxGeometry args={[part.width, part.height, part.depth]} />
                    <meshStandardMaterial
                        color={jobColor}
                        transparent
                        opacity={0.2}
                        wireframe
                    />
                </mesh>
            )}

            {/* Main mesh with glow effect for new parts */}
            <mesh castShadow receiveShadow ref={meshRef}>
                <boxGeometry args={[part.width, part.height, part.depth]} />
                <meshStandardMaterial
                    color={jobColor}
                    metalness={0.1}
                    roughness={0.5}
                    emissive={jobColor}
                    emissiveIntensity={isNew ? 0.8 : (hovered ? 0.5 : 0.2)}
                    transparent
                    opacity={opacity}
                />
            </mesh>

            {/* White edges */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(part.width, part.height, part.depth)]} />
                <lineBasicMaterial color="#ffffff" opacity={0.8} transparent />
            </lineSegments>

            {/* Part label */}
            <Text
                position={[0, 0, 0]}
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

            {/* Floating tooltip on hover */}
            {hovered && (
                <Html position={[0, part.height / 2 + 15, 0]} center>
                    <div style={{
                        background: 'rgba(0,0,0,0.85)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        border: `2px solid ${jobColor}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontWeight: 'bold', color: jobColor }}>Parça #{part.parca}</div>
                        <div>{part.width} × {part.depth} × {part.height}</div>
                        <div>Pozisyon: ({part.x}, {part.y}, {part.z})</div>
                    </div>
                </Html>
            )}
        </group>
    );
});

// Memoized Machine Box
const MachineBox = memo(function MachineBox({
    machine,
    machineId,
    parts,
    jobColor,
    jobId,
    isActive,
    onPartClick
}: {
    machine: Machine;
    machineId: number;
    parts: PlacedPart[];
    jobColor: string;
    jobId: number;
    isActive?: boolean;
    onPartClick?: (part: PlacedPart) => void;
}) {
    return (
        <group position={[machineId * (machine.xKen + 30), 0, 0]}>
            {/* Machine base platform */}
            <mesh position={[machine.xKen / 2, -1, machine.yKenar / 2]} receiveShadow>
                <boxGeometry args={[machine.xKen + 4, 2, machine.yKenar + 4]} />
                <meshStandardMaterial
                    color={isActive ? '#e94560' : '#374151'}
                    metalness={0.2}
                    roughness={0.8}
                />
            </mesh>

            {/* Machine floor indicator */}
            <mesh position={[machine.xKen / 2, 0.1, machine.yKenar / 2]}>
                <boxGeometry args={[machine.xKen, 0.2, machine.yKenar]} />
                <meshStandardMaterial
                    color={jobColor}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Progress bar showing fill level */}
            <group position={[machine.xKen + 10, machine.maxYukseklik / 2, 0]}>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[4, machine.maxYukseklik, 4]} />
                    <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
                </mesh>
                <mesh position={[0, -machine.maxYukseklik / 2, 0]} scale={[1, parts.length > 0 ? Math.min(parts.length / 10, 1) : 0, 1]}>
                    <boxGeometry args={[4, machine.maxYukseklik, 4]} />
                    <meshStandardMaterial color={jobColor} transparent opacity={0.8} />
                </mesh>
            </group>

            {/* Job label */}
            <Text
                position={[machine.xKen / 2, machine.maxYukseklik + 20, -machine.yKenar / 2 - 10]}
                fontSize={14}
                color={jobColor}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {`Is ${jobId}`}
            </Text>

            {/* Machine ID label */}
            <Text
                position={[machine.xKen / 2, machine.maxYukseklik + 20, machine.yKenar / 2 + 10]}
                fontSize={14}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {`Makine ${machineId}`}
            </Text>

            {/* Parts */}
            {parts.map((part, idx) => (
                <AnimatedPart
                    key={`${part.parca}-${idx}`}
                    part={part}
                    jobColor={jobColor}
                    isNew={false}
                    onClick={() => onPartClick?.(part)}
                />
            ))}
        </group>
    );
});

// Particle burst effect for successful placement
function ParticleBurst({ position, color }: { position: [number, number, number]; color: string }) {
    const particlesRef = useRef<THREE.Group>(null);
    const [particles] = useState(() => {
        return Array.from({ length: 20 }, () => ({
            velocity: [
                (Math.random() - 0.5) * 5,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 5
            ] as [number, number, number],
            opacity: 1
        }));
    });

    useFrame((_, delta) => {
        if (particlesRef.current) {
            particlesRef.current.children.forEach((child, i) => {
                const p = particles[i];
                child.position.x += p.velocity[0] * delta;
                child.position.y += p.velocity[1] * delta;
                child.position.z += p.velocity[2] * delta;
                p.velocity[1] -= 10 * delta; // Gravity

                // Fade out
                const mesh = child as THREE.Mesh;
                if (mesh.material instanceof THREE.MeshBasicMaterial) {
                    particles[i].opacity -= delta * 2;
                    mesh.material.opacity = Math.max(0, particles[i].opacity);
                }
            });
        }
    });

    return (
        <group ref={particlesRef} position={position}>
            {particles.map((_, i) => (
                <group key={i}>
                    <mesh>
                        <sphereGeometry args={[1.5, 8, 8]} />
                        <meshBasicMaterial color={color} transparent opacity={1} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Camera controller for follow mode
function CameraController({
    currentStep,
    stepData,
    machines,
    followMode
}: {
    currentStep: number;
    stepData: PlacementStep | null;
    machines: Machine[];
    followMode: boolean;
}) {
    const controlsRef = useRef<CameraControls>(null);
    const targetRef = useRef<[number, number, number]>([0, 0, 0]);

    // Update camera target when step changes
    useEffect(() => {
        if (!followMode || !stepData?.finalPlacement) return;

        const { machineId, position } = stepData.finalPlacement;
        const machine = machines.find(m => m.id === machineId);
        if (!machine) return;

        const zOffset = (stepData.finalPlacement.jobId - 1) * (Math.max(...machines.map(m => m.yKenar)) + 100);
        const newTarget: [number, number, number] = [
            machineId * (machine.xKen + 30) + position.x + machine.xKen / 2,
            position.z + 50,
            zOffset + position.y + machine.yKenar / 2
        ];

        targetRef.current = newTarget;

        controlsRef.current?.setLookAt(
            newTarget[0] + 150, newTarget[1] + 100, newTarget[2] + 200,
            newTarget[0], newTarget[1], newTarget[2],
            true
        );
    }, [currentStep, stepData, machines, followMode]);

    return (
        <CameraControls
            ref={controlsRef}
            minDistance={50}
            maxDistance={1000}
            maxPolarAngle={Math.PI / 2}
        />
    );
}

// Main 3D Scene
function Scene({
    placementLog,
    currentStep,
    machines,
    allParts,
    followMode
}: {
    placementLog: PlacementLog;
    currentStep: number;
    machines: Machine[];
    allParts: Part[];
    followMode: boolean;
}) {
    const { jobs } = useMemo(() =>
        getStateAtStep(placementLog.steps, currentStep, allParts),
        [placementLog, currentStep, allParts]
    );

    const step = placementLog.steps[currentStep];
    const newPlacement = step?.finalPlacement;
    const currentAttempt = step?.attempts[step.attempts.length - 1];

    // Particle burst for successful placement
    const [burstPosition, setBurstPosition] = useState<[number, number, number] | null>(null);
    const [burstColor, setBurstColor] = useState('#10b981');

    useEffect(() => {
        if (newPlacement && step.attempts.some(a => a.success)) {
            const machine = machines.find(m => m.id === newPlacement.machineId);
            if (machine) {
                const zOffset = (newPlacement.jobId - 1) * (Math.max(...machines.map(m => m.yKenar)) + 100);
                setBurstPosition([
                    newPlacement.machineId * (machine.xKen + 30) + newPlacement.position.x + machine.xKen / 2,
                    newPlacement.position.z + machine.maxYukseklik / 2,
                    zOffset + newPlacement.position.y + machine.yKenar / 2
                ]);
                setBurstColor(JOB_COLORS[(newPlacement.jobId - 1) % JOB_COLORS.length]);
            }
        }
    }, [newPlacement, step, machines]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[200, 300, 400]} fov={50} />
            <CameraController
                currentStep={currentStep}
                stepData={step}
                machines={machines}
                followMode={followMode}
            />

            <ambientLight intensity={0.5} />
            <directionalLight position={[100, 200, 100]} intensity={1} castShadow />
            <directionalLight position={[-100, 200, -100]} intensity={0.5} />

            {/* Render each job and its machines */}
            {Array.from(jobs.entries()).map(([jobId, jobMachines]) => {
                const jobColor = JOB_COLORS[(jobId - 1) % JOB_COLORS.length];
                const zOffset = (jobId - 1) * (Math.max(...machines.map(m => m.yKenar)) + 100);

                return (
                    <group key={jobId} position={[0, 0, zOffset]}>
                        {Array.from(jobMachines.entries()).map(([machineId, parts]) => {
                            const machine = machines.find(m => m.id === machineId);
                            if (!machine) return null;

                            return (
                                <MachineBox
                                    key={`${jobId}-${machineId}`}
                                    machine={machine}
                                    machineId={machineId}
                                    parts={parts}
                                    jobColor={jobColor}
                                    jobId={jobId}
                                    isActive={currentAttempt?.machineId === machineId && currentAttempt?.jobId === jobId}
                                />
                            );
                        })}
                    </group>
                );
            })}

            {/* New part with drop animation */}
            {newPlacement && (
                <group key={`new-part-${currentStep}`}>
                    {(() => {
                        const part = allParts.find(p => p.parca === step.partId);
                        if (!part) return null;

                        const jobColor = JOB_COLORS[(newPlacement.jobId - 1) % JOB_COLORS.length];

                        return (
                            <AnimatedPart
                                part={{
                                    parca: step.partId,
                                    x: newPlacement.position.x,
                                    y: newPlacement.position.y,
                                    z: newPlacement.position.z,
                                    width: part.kenar1,
                                    depth: part.kenar2,
                                    height: part.yukseklik,
                                }}
                                jobColor={jobColor}
                                isNew={true}
                                showGhost={true}
                            />
                        );
                    })()}
                </group>
            )}

            {/* Particle burst */}
            {burstPosition && (
                <ParticleBurst position={burstPosition} color={burstColor} />
            )}

            {/* Post-processing effects */}
            {/* EffectComposer, Bloom, SSAO, Vignette removed - requires @react-three/postprocessing */}
        </>
    );
}

export function AlgorithmAnimation({ placementLog, machines, parts }: AlgorithmAnimationProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [showDetails, setShowDetails] = useState(true);
    const [followMode, setFollowMode] = useState(false);
    const controlsRef = useRef<CameraControls>(null);

    const steps = placementLog.steps;
    const totalSteps = steps.length;
    const currentStepData = steps[currentStep];

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    setIsPlaying(p => !p);
                    break;
                case 'ArrowLeft':
                    setIsPlaying(false);
                    setCurrentStep(Math.max(0, currentStep - 1));
                    break;
                case 'ArrowRight':
                    setIsPlaying(false);
                    setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));
                    break;
                case 'KeyR':
                    setFollowMode(false);
                    controlsRef.current?.setLookAt(200, 300, 400, 0, 0, 0, true);
                    break;
                case 'KeyF':
                    setFollowMode(p => !p);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, totalSteps]);

    // Auto-play with useFrame-like behavior using setInterval
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= totalSteps - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, speed, totalSteps]);

    // Format score
    const formatScore = (score?: number) => {
        if (score === undefined) return '-';
        return score.toLocaleString();
    };

    // Get attempt summary
    const getAttemptSummary = (attempts: PlacementAttempt[]) => {
        if (attempts.length === 0) return null;

        const lastAttempt = attempts[attempts.length - 1];
        if (lastAttempt.success) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <div style={{
                        padding: '10px',
                        background: '#065f46',
                        borderRadius: '6px',
                        borderLeft: '4px solid #10b981'
                    }}>
                        <strong style={{ color: '#10b981' }}>✓ Basarili Yerlesim</strong>
                        <div style={{ marginTop: '8px', color: '#fff', fontSize: '13px' }}>
                            <div>Makine: <strong>{lastAttempt.machineId}</strong></div>
                            <div>Is: <strong>{lastAttempt.jobId}</strong></div>
                            <div>Pozisyon: ({lastAttempt.position?.x}, {lastAttempt.position?.y}, {lastAttempt.position?.z})</div>
                            <div>Skor: <strong style={{ color: '#fbbf24' }}>{formatScore(lastAttempt.score)}</strong></div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ marginTop: '10px' }}>
                <div style={{
                    padding: '10px',
                    background: '#7f1d1d',
                    borderRadius: '6px',
                    borderLeft: '4px solid #ef4444'
                }}>
                    <strong style={{ color: '#ef4444' }}>✗ Yerlesim Basarisiz</strong>
                    <div style={{ marginTop: '8px', color: '#fff', fontSize: '13px' }}>
                        <div>Makine: <strong>{lastAttempt.machineId}</strong></div>
                        <div>Is: <strong>{lastAttempt.jobId}</strong></div>
                        <div>Sebep: <strong>{lastAttempt.reason}</strong></div>
                    </div>
                </div>
            </div>
        );
    };

    const isNewJobCreated = currentStep > 0 &&
        steps[currentStep].currentJobCount > steps[currentStep - 1].currentJobCount;

    // Calculate stats
    const placedParts = currentStep + 1;
    const totalParts = steps.length;
    const fillPercentage = Math.round((placedParts / totalParts) * 100);

    return (
        <div style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h3 style={{ color: '#e94560', margin: 0 }}>
                    3D Algoritma Animasyonu - Adim {currentStep + 1} / {totalSteps}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setFollowMode(!followMode)}
                        style={{
                            background: followMode ? '#10b981' : '#6b7280',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {followMode ? '✓ Takip Açık' : 'Takip Kapalı'} (F)
                    </button>
                    <button
                        onClick={() => {
                            setFollowMode(false);
                            controlsRef.current?.setLookAt(200, 300, 400, 0, 0, 0, true);
                        }}
                        style={{
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Sıfırla (R)
                    </button>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {showDetails ? 'Detaylari Gizle' : 'Detaylari Goster'}
                    </button>
                </div>
            </div>

            {/* Floating Stats Panel */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(22, 33, 62, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 100
            }}>
                <div style={{ color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    İstatistikler
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ color: '#fff', fontSize: '14px' }}>
                        <span style={{ color: '#10b981' }}>✓</span> {placedParts} / {totalParts} Parça
                    </div>
                    <div style={{ color: '#fff', fontSize: '14px' }}>
                        <span style={{ color: '#f59e0b' }}>⏱</span> Cmax: {currentStepData?.currentCmax.toFixed(2) || '0'}
                    </div>
                    <div style={{ color: '#fff', fontSize: '14px' }}>
                        <span style={{ color: '#3b82f6' }}>📦</span> İş: {currentStepData?.currentJobCount || 1}
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: '150px', height: '6px', background: '#0f3460', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${fillPercentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>
                        {fillPercentage}% Dolu
                    </div>
                </div>
            </div>

            {/* Step Info */}
            {currentStepData && showDetails && (
                <div style={{
                    background: '#16213e',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                    border: '1px solid #0f3460'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px',
                        marginBottom: '15px'
                    }}>
                        <div style={{ padding: '10px', background: '#0f3460', borderRadius: '6px' }}>
                            <div style={{ color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase' }}>Parca ID</div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                                #{currentStepData.partId}
                            </div>
                        </div>
                        <div style={{ padding: '10px', background: '#0f3460', borderRadius: '6px' }}>
                            <div style={{ color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase' }}>Boyutlar</div>
                            <div style={{ color: '#fff', fontSize: '14px' }}>
                                {currentStepData.partDimensions.width} x {currentStepData.partDimensions.depth} x {currentStepData.partDimensions.height}
                            </div>
                        </div>
                        <div style={{ padding: '10px', background: '#0f3460', borderRadius: '6px' }}>
                            <div style={{ color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase' }}>Cmax</div>
                            <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>
                                {currentStepData.currentCmax.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ padding: '10px', background: '#0f3460', borderRadius: '6px' }}>
                            <div style={{ color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase' }}>Is Sayisi</div>
                            <div style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 'bold' }}>
                                {currentStepData.currentJobCount}
                            </div>
                        </div>
                    </div>

                    {isNewJobCreated && (
                        <div style={{
                            padding: '12px',
                            background: '#4c1d95',
                            borderRadius: '6px',
                            marginBottom: '15px',
                            borderLeft: '4px solid #a78bfa'
                        }}>
                            <strong style={{ color: '#a78bfa' }}>📌 YENI IS ACILDI!</strong>
                            <span style={{ color: '#fff', marginLeft: '10px' }}>
                                Makine kapasitesi doldugu için yeni bir is olusturuldu.
                            </span>
                        </div>
                    )}

                    {getAttemptSummary(currentStepData.attempts)}
                </div>
            )}

            {/* 3D Canvas */}
            <div style={{ height: '650px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #0f3460' }}>
                <Canvas shadows>
                    <Scene
                        placementLog={placementLog}
                        currentStep={currentStep}
                        machines={machines}
                        allParts={parts}
                        followMode={followMode}
                    />
                </Canvas>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '15px',
                flexWrap: 'wrap',
                padding: '15px',
                background: '#16213e',
                borderRadius: '8px'
            }}>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        background: isPlaying ? '#e94560' : '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    {isPlaying ? '⏸ Durdur (Space)' : '▶ Oynat (Space)'}
                </button>

                <button
                    onClick={() => {
                        setIsPlaying(false);
                        setCurrentStep(0);
                        setFollowMode(false);
                    }}
                    style={{
                        background: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    ⏮ Başlangıç
                </button>

                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={() => {
                            setIsPlaying(false);
                            setCurrentStep(Math.max(0, currentStep - 1));
                        }}
                        disabled={currentStep === 0}
                        style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            opacity: currentStep === 0 ? 0.5 : 1
                        }}
                    >
                        ◀ (←)
                    </button>

                    <button
                        onClick={() => {
                            setIsPlaying(false);
                            setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));
                        }}
                        disabled={currentStep === totalSteps - 1}
                        style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            cursor: currentStep === totalSteps - 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            opacity: currentStep === totalSteps - 1 ? 0.5 : 1
                        }}
                    >
                        (→) ▶
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ color: '#fff', fontSize: '13px' }}>Hız:</label>
                    <select
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        style={{
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid #0f3460',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        <option value={2000}>Çok Yavaş (2s)</option>
                        <option value={1000}>Yavaş (1s)</option>
                        <option value={500}>Normal (0.5s)</option>
                        <option value={250}>Hızlı (0.25s)</option>
                        <option value={100}>Çok Hızlı (0.1s)</option>
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <input
                        type="range"
                        min="0"
                        max={totalSteps - 1}
                        value={currentStep}
                        onChange={(e) => {
                            setIsPlaying(false);
                            setCurrentStep(Number(e.target.value));
                        }}
                        style={{ width: '100%', accentColor: '#e94560', cursor: 'pointer' }}
                    />
                    <div style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', marginTop: '4px' }}>
                        {currentStep + 1} / {totalSteps}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: '15px',
                padding: '12px 15px',
                background: '#16213e',
                borderRadius: '6px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>İş Renkleri:</span>
                {JOB_COLORS.slice(0, 6).map((color, idx) => (
                    <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '14px', height: '14px', background: color, borderRadius: '3px' }}></span>
                        <span style={{ color: '#fff', fontSize: '12px' }}>İş {idx + 1}</span>
                    </span>
                ))}
                <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: 'auto' }}>
                    Klavye: Space=Oynat, ←→=Adım, R=Sıfırla, F=Takip
                </span>
            </div>
        </div>
    );
}
