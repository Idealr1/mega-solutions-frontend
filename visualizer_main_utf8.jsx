import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, TransformControls, ContactShadows, Sky, Text } from '@react-three/drei';
import { Upload, HelpCircle, Move, RotateCcw, Maximize, Save, Trash2, Plus, EyeOff, Sparkles, Ruler, ChefHat, Home, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './Visualizer.css';

// Global cabinet registry to prevent stale ref crashes and "Read Only" errors during Fiber reconciliation
const cabinetRegistry = new Map();

// --- Wizard Components (Moved up for scope stability) ---
const WizardSelection = ({ setIntent, setWizardStep, handleSampleMode }) => (
    <div className="wizard-screen">
        <div className="wizard-card">
            <Sparkles size={48} className="wizard-logo-icon" />
            <h1>What are we designing?</h1>
            <p>Gemini will analyze your photo and match the perfect cabinets for your project.</p>
            <div className="selection-grid">
                <button className="selection-card" onClick={() => { setIntent('kitchen'); setWizardStep('upload'); }}>
                    <div className="card-icon"><ChefHat size={48} /></div>
                    <h3>Kitchen Cabinetry</h3>
                    <p>High-end base, upper, and pantry units.</p>
                </button>
                <button className="selection-card" onClick={() => { setIntent('room'); setWizardStep('upload'); }}>
                    <div className="card-icon"><Home size={48} /></div>
                    <h3>Room Furniture</h3>
                    <p>Custom wardrobes and living room solutions.</p>
                </button>
            </div>
            <div className="wizard-footer">
                <button className="secondary-btn" onClick={handleSampleMode}>
                    <EyeOff size={18} /> Or Try Instant Demo (Sample Mode)
                </button>
            </div>
        </div>
    </div>
);

const WizardUpload = ({ setWizardStep, handleImageUpload, error, handleSampleMode }) => (
    <div className="wizard-screen">
        <div className="wizard-card">
            <button className="back-link" onClick={() => setWizardStep('selection')}><ArrowLeft size={16} /> Back</button>
            <h1>Upload Room Photo</h1>
            <p>Take a clear photo of the wall where you want to place the cabinetry.</p>

            <label className="upload-dropzone">
                <Upload size={48} />
                <span>Click to Capture or Upload Photo</span>
                <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
            </label>
            {error && (
                <div className="wizard-error-container">
                    <p className="wizard-error">{error}</p>
                    <button className="action-btn" onClick={handleSampleMode}>
                        Try with Sample Room
                    </button>
                </div>
            )}
        </div>
    </div>
);

const DreamingOverlay = () => (
    <div className="wizard-screen">
        <div className="dreaming-content">
            <div className="dreaming-loader">
                <Sparkles className="sparkle-1" />
                <Sparkles className="sparkle-2" />
                <Sparkles className="sparkle-3" />
            </div>
            <h2>Mega Solutions is analyzing your space...</h2>
            <p>Detecting walls, perspective, and lighting for a 100% realistic miracle.</p>
        </div>
    </div>
);

// Professional Error Boundary for 3D Scene
class VisualizerErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) {
        console.error("Visualizer Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="visualizer-error">
                    <h3>Something went wrong with the visualizer.</h3>
                    <button onClick={() => window.location.reload()}>Reload Visualizer</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// OcclusionMask Component - Masks out objects like plants or furniture for realistic depth
const OcclusionMask = ({ points, polygon, imageAspect, zIndex = 10, fov = 65 }) => {
    const geometry = useMemo(() => {
        if (polygon && polygon.length >= 3) {
            const aspect = imageAspect || 1.77;
            const vFovRad = (fov * Math.PI) / 180;
            const distance = 14;
            const h = Math.tan(vFovRad / 2) * distance;
            const w = h * aspect;

            const shapePts = polygon.map(p => {
                const ndcx = (p.x / 50) - 1;
                const ndcy = 1 - (p.y / 50);
                return new THREE.Vector2(ndcx * w, ndcy * h);
            });

            const shape = new THREE.Shape(shapePts);
            return new THREE.ShapeGeometry(shape);
        }
        return null;
    }, [polygon, imageAspect, fov]);

    if (!geometry) return null;

    // Use negative z to place in front or behind cabinets based on zIndex
    // z = -4 is the surface plane. Lower zIndex means further back.
    const zOffset = (zIndex - 5) * 0.05; // Adjust depth based on detected zIndex
    const depth = -4.0 + zOffset;

    return (
        <group>
            <mesh renderOrder={zIndex} geometry={geometry} position={[0, 0, depth]}>
                <meshBasicMaterial colorWrite={false} side={2} />
            </mesh>
        </group>
    );
};

// Surface Component - Represents a traceable or detected wall/floor
// 3D Surface - Now used for invisible math/raycasting only
const Surface = ({ id, points, polygon, color = "#28a745", opacity = 0.2, onClick, isSelected, onSelect, name, imageAspect, orientation = 'back' }) => {
    const geom = useMemo(() => {
        if (polygon && polygon.length >= 3) {
            const aspect = imageAspect || 1.77;
            const vFovRad = (65 * Math.PI) / 180;
            const distance = 14;
            const h = Math.tan(vFovRad / 2) * distance;
            const w = h * aspect;
            const shapePts = polygon.map(p => {
                const ndcx = (p.x / 50) - 1;
                const ndcy = 1 - (p.y / 50);
                return new THREE.Vector2(ndcx * w, ndcy * h);
            });
            const shape = new THREE.Shape(shapePts);
            return new THREE.ShapeGeometry(shape);
        }
        return null;
    }, [polygon, imageAspect]);

    if (!geom) return null;

    // Rotation based on orientation
    let rotation = [0, 0, 0];
    if (orientation === 'left') rotation = [0, Math.PI / 2, 0];
    if (orientation === 'right') rotation = [0, -Math.PI / 2, 0];

    return (
        <group rotation={rotation}>
            <mesh
                geometry={geom}
                position={[0, 0, -4.01]}
                renderOrder={2}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onSelect) onSelect(id);
                    if (onClick) onClick(e);
                }}
                visible={false}
            >
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
};

// --- ENGINE V5: Pixel-Perfect 2D Highlight + SVG Cabinet Fill ---
const SurfaceOverlay = ({ surfaces, selectedId, filledWalls, onSelect }) => {
    return (
        <svg
            className="segmentation-overlay"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Clip paths for each filled wall */}
                {filledWalls.map(fw => {
                    const s = surfaces.find(x => x.id === fw.id);
                    if (!s?.polygon) return null;
                    return (
                        <clipPath key={`clip-${fw.id}`} id={`wfclip-${fw.id}`}>
                            <polygon points={s.polygon.map(p => `${p.x},${p.y}`).join(' ')} />
                        </clipPath>
                    );
                })}
            </defs>

            {surfaces.map(s => {
                if (!s.polygon || s.polygon.length < 3) return null;
                const pointsStr = s.polygon.map(p => `${p.x},${p.y}`).join(' ');
                const isSelected = selectedId === s.id;
                const isWall = s.type === 'wall';
                const color = isWall ? '#22c55e' : '#f97316';
                const cx = s.polygon.reduce((a, p) => a + p.x, 0) / s.polygon.length;
                const cy = s.polygon.reduce((a, p) => a + p.y, 0) / s.polygon.length;
                const orientLabel = s.orientation === 'left' ? '\u2190 Left Wall'
                    : s.orientation === 'right' ? 'Right Wall \u2192'
                        : s.type === 'floor' ? 'Floor' : 'Back Wall';
                return (
                    <g key={s.id}>
                        {isSelected && (
                            <polygon points={pointsStr} fill="none" stroke={color}
                                strokeWidth={1.2} opacity={0.4} filter="url(#glow)"
                                style={{ pointerEvents: 'none' }} />
                        )}
                        <polygon points={pointsStr} fill={color}
                            fillOpacity={isSelected ? 0.12 : 0.02}
                            stroke={color}
                            strokeWidth={isSelected ? 0.6 : 0.25}
                            strokeOpacity={isSelected ? 1.0 : 0.55}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); onSelect(s.id); }} />
                        <g style={{ pointerEvents: 'none' }}>
                            <rect x={cx - 8} y={cy - 3} width={16} height={5} rx={1}
                                fill={isSelected ? color : 'rgba(0,0,0,0.55)'}
                                opacity={isSelected ? 0.9 : 0.7} />
                            <text x={cx} y={cy + 0.8} textAnchor="middle"
                                dominantBaseline="middle" fontSize="2.2"
                                fill="white" fontWeight={isSelected ? 'bold' : 'normal'}
                                fontFamily="sans-serif">
                                {isSelected ? `\u2713 ${orientLabel}` : orientLabel}
                            </text>
                        </g>
                    </g>
                );
            })}
        </svg>
    );
};


// --- ENGINE V4: High-Fidelity Procedural Shaker Cabinet ---
const ShakerCabinet = ({ material, type, isSelected, height, depth }) => {
    const materialConfigs = {
        white: { color: "#fafaf9", roughness: 0.15, metalness: 0, clearcoat: 1.0, envMapIntensity: 1.2, ior: 1.5, thickness: 0.1 },
        oak: { color: "#d2b48c", roughness: 0.8, metalness: 0, clearcoat: 0.1, envMapIntensity: 0.5 },
        walnut: { color: "#5d4037", roughness: 0.7, metalness: 0, clearcoat: 0.1, envMapIntensity: 0.5 },
        grey: { color: "#757575", roughness: 0.4, metalness: 0, clearcoat: 0.5 },
        black: { color: "#1a1a1a", roughness: 0.3, metalness: 0.1, clearcoat: 0.8 },
        navy: { color: "#1a237e", roughness: 0.25, metalness: 0.2, clearcoat: 1.0 },
    };
    const config = materialConfigs[material] || materialConfigs.white;
    const isUpper = type === 'upper';
    const isPantry = type === 'pantry';

    // Standard Kitchen Dimensions
    const toeKickHeight = isUpper ? 0 : 0.1;
    const bodyHeight = height - toeKickHeight;

    return (
        <group>
            {/* 1. Toe-Kick (Recessed base) - Adjusted for zero-gap continuity */}
            {!isUpper && (
                <mesh castShadow position={[0, toeKickHeight / 2, -0.05]}>
                    <boxGeometry args={[0.8, toeKickHeight, depth - 0.05]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={1.0} />
                </mesh>
            )}

            {/* 2. Main Cabinet Box */}
            <mesh castShadow receiveShadow position={[0, toeKickHeight + bodyHeight / 2, 0]}>
                <boxGeometry args={[0.8, bodyHeight, depth]} />
                <meshPhysicalMaterial {...config} />
            </mesh>

            {/* 3. Stone Countertop (Polished Stone look) */}
            {!isUpper && !isPantry && (
                <mesh castShadow receiveShadow position={[0, height + 0.02, 0.03]}>
                    <boxGeometry args={[0.8, 0.04, depth + 0.06]} />
                    <meshPhysicalMaterial
                        color="#e0e0e0"
                        roughness={0.02}
                        metalness={0.1}
                        clearcoat={1.0}
                        reflectivity={1.0}
                    />
                </mesh>
            )}

            {/* 4. Shaker Door Layer (with bevel simulation) */}
            <group position={[0, toeKickHeight + bodyHeight / 2, depth / 2]}>
                {/* Outer Frame (Beveled) */}
                <mesh position={[0, 0, 0.015]} castShadow>
                    <boxGeometry args={[0.78, bodyHeight - 0.02, 0.03]} />
                    <meshPhysicalMaterial {...config} />
                </mesh>

                {/* Recessed Panel (Inward Offset) */}
                <mesh position={[0, 0, 0.005]}>
                    <boxGeometry args={[0.62, bodyHeight - 0.18, 0.01]} />
                    <meshPhysicalMaterial 
                        color={config.color} 
                        roughness={config.roughness + 0.1} 
                        metalness={0} 
                        envMapIntensity={0.4}
                    />
                </mesh>

                {/* 5. Luxury Bar Handle (Brushed Gold/Steel depending on mat) */}
                <group position={[0.34, isUpper ? -bodyHeight * 0.35 : (isPantry ? 0 : bodyHeight * 0.38), 0.04]}>
                    <mesh rotation={[0, 0, (isPantry || isUpper) ? 0 : Math.PI / 2]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.3, 16]} />
                        <meshStandardMaterial 
                            color={material === 'white' ? "#d4af37" : "#e0e0e0"} 
                            metalness={0.9} 
                            roughness={0.1} 
                        />
                    </mesh>
                    {/* Handle Connectors */}
                    <mesh position={[0, 0.1, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.03]} />
                        <meshStandardMaterial color="#888" metalness={1} />
                    </mesh>
                    <mesh position={[0, -0.1, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.03]} />
                        <meshStandardMaterial color="#888" metalness={1} />
                    </mesh>
                </group>
            </group>

            {/* Selection Highlight */}
            {isSelected && (
                <mesh position={[0, height / 2, 0]}>
                    <boxGeometry args={[0.82, height + 0.1, depth + 0.1]} />
                    <meshBasicMaterial color="#EC4E15" wireframe transparent opacity={0.4} />
                </mesh>
            )}
        </group>
    );
};

const Cabinet = ({ id, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], onSelect, isSelected, material, type }) => {
    const isUpper = type === 'upper';
    const isPantry = type === 'pantry';
    const height = isPantry ? 2.3 : (isUpper ? 0.8 : 0.9);
    const depth = isUpper ? 0.35 : 0.6;

    const groupRef = useRef();

    useEffect(() => {
        if (groupRef.current) {
            cabinetRegistry.set(id, groupRef.current);
        }
        return () => cabinetRegistry.delete(id);
    }, [id]);

    return (
        <group
            ref={groupRef}
            name={id.toString()}
            position-x={position?.[0] ?? 0}
            position-y={position?.[1] ?? 0}
            position-z={position?.[2] ?? 0}
            rotation-x={rotation?.[0] ?? 0}
            rotation-y={rotation?.[1] ?? 0}
            rotation-z={rotation?.[2] ?? 0}
            scale-x={scale?.[0] ?? 1}
            scale-y={scale?.[1] ?? 1}
            scale-z={scale?.[2] ?? 1}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <ShakerCabinet
                material={material}
                type={type}
                isSelected={isSelected}
                height={height}
                depth={depth}
            />
        </group>
    );
};

// Snapping Logic Helper
const getSnappedPosition = (id, position, otherCabinets) => {
    let snappedPos = [...position];
    otherCabinets.forEach(other => {
        if (other.id === id) return;
        const dx = Math.abs(position[0] - other.position[0]);
        const dz = Math.abs(position[2] - other.position[2]);
        const dy = Math.abs(position[1] - other.position[1]);

        if (dx < 1.1 && dx > 0.9 && dz < 0.2 && dy < 0.2) {
            snappedPos[0] = other.position[0] + (position[0] > other.position[0] ? 1.0 : -1.0);
            snappedPos[2] = other.position[2];
            snappedPos[1] = other.position[1];
        }
    });
    return snappedPos;
};

// Helper component to handle TransformControls with access to Three.js scene
const ControlsHandler = ({ selectedId, transformMode, mode, onMoveEnd, orbitRef, cabinets }) => {
    const objectRef = useRef();

    // Registry-based tracking avoids stale scene searches and "read-only" property errors
    useEffect(() => {
        if (selectedId) {
            objectRef.current = cabinetRegistry.get(selectedId);
        } else {
            objectRef.current = null;
        }
    }, [selectedId, cabinets, mode]);

    if (!selectedId || mode !== 'place' || !objectRef.current) return null;

    return (
        <TransformControls
            object={objectRef.current}
            mode={transformMode}
            onMouseDown={() => {
                const orbit = orbitRef?.current;
                if (orbit) orbit.enabled = false;
            }}
            onMouseUp={() => {
                const orbit = orbitRef?.current;
                if (orbit) orbit.enabled = false; // System is now static for precision
                const obj = objectRef.current;
                if (obj) {
                    // One final sync to state
                    onMoveEnd(selectedId, {
                        position: [obj.position.x, obj.position.y, obj.position.z],
                        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z]
                    });
                }
            }}
            onObjectChange={() => {
                const obj = objectRef.current;
                if (obj && transformMode === 'translate') {
                    // Mutation is fine for performance, but we must be careful with R3F state
                    const snapped = getSnappedPosition(selectedId, [obj.position.x, obj.position.y, obj.position.z], cabinets);
                    obj.position.set(...snapped);
                }
            }}
        />
    );
};

const Visualizer = () => {
    const [roomImage, setRoomImage] = useState(null);
    const [cabinets, setCabinets] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showGrid, setShowGrid] = useState(false);
    const [fov, setFov] = useState(65);
    const [imageDims, setImageDims] = useState({ width: 0, height: 0, aspect: 1 });
    const [lightingCondition, setLightingCondition] = useState('natural');
    const [autoMode, setAutoMode] = useState(false);
    const [mode, setMode] = useState('place'); // 'align', 'place', 'trace', 'mask', 'measure'
    const [transformMode, setTransformMode] = useState('translate');
    const [surfaces, setSurfaces] = useState([]); // List of defined surface planes
    const [selectedSurfaceId, setSelectedSurfaceId] = useState(null);
    const [pendingWallId, setPendingWallId] = useState(null);
    const [fillToast, setFillToast] = useState(null);
    const [filledWalls, setFilledWalls] = useState([]); // { id, color, count } per filled wall
    const [masks, setMasks] = useState([]); // Occlusion masks
    const [tempPoints, setTempPoints] = useState([]); // Points for tracing
    const [measurePoints, setMeasurePoints] = useState([]); // Points for measurement
    const orbitRef = useRef();

    // Wizard Flow States (selection -> upload -> dreaming -> visualizer)
    const [wizardStep, setWizardStep] = useState('selection');
    const [intent, setIntent] = useState(null); // 'kitchen' or 'room'
    const [error, setError] = useState(null);

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear the entire design?")) {
            setCabinets([]);
            setSurfaces([]);
            setMasks([]);
            setSelectedId(null);
            setSelectedSurfaceId(null);
            setTempPoints([]);
            setMeasurePoints([]);
        }
    };

    const autoDetectWalls = () => {
        // "AI Segmentation" Helper: Creates a standard 3-plane room model as a starting point
        // In a production app, this would be replaced by a Mediapipe or TensorFlow segmentation call
        const defaultSurfaces = [
            {
                id: Date.now() + 1,
                name: "Back Wall",
                points: [
                    [-8, 0, -5],
                    [8, 0, -5],
                    [8, 6, -5],
                    [-8, 6, -5]
                ]
            },
            {
                id: Date.now() + 2,
                name: "Floor",
                points: [
                    [-10, 0, 10],
                    [10, 0, 10],
                    [8, 0, -5],
                    [-8, 0, -5]
                ]
            }
        ];
        setSurfaces(defaultSurfaces);
        setSelectedSurfaceId(defaultSurfaces[0].id);
    };

    const handleSnapshot = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `my-design-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    const handleSaveDesign = async () => {
        const name = prompt("Enter a name for your design:", "My Kitchen Design");
        if (!name) return;

        try {
            const payload = {
                name: name,
                data: {
                    cabinets,
                    surfaces,
                    masks,
                    fov,
                    roomImage
                }
            };
            await api.post('/api/designs', payload);
            alert("Design saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save design. Make sure you are logged in.");
        }
    };

    const fetchDesigns = async () => {
        try {
            const response = await api.get('/api/designs');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch designs:", error);
            alert("Failed to load designs.");
            return [];
        }
    };

    const handleLoadDesign = async () => {
        const designs = await fetchDesigns();
        if (designs.length === 0) {
            alert("No saved designs found.");
            return;
        }

        const designNames = designs.map(d => d.name).join("\n");
        const selectedName = prompt(`Enter the name of the design to load:\n${designNames}`);

        if (!selectedName) return;

        const designToLoad = designs.find(d => d.name === selectedName);
        if (designToLoad) {
            const { cabinets, surfaces, masks, fov, roomImage } = designToLoad.data;
            setCabinets(cabinets || []);
            setSurfaces(surfaces || []);
            setMasks(masks || []);
            setFov(fov || 50);
            setRoomImage(roomImage || null);
            setSelectedId(null); // Clear selection after loading
            setMode('place'); // Reset mode
            alert(`Design "${selectedName}" loaded successfully!`);
        } else {
            alert(`Design "${selectedName}" not found.`);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                setRoomImage(base64);

                // Capture Aspect Ratio
                const img = new Image();
                img.onload = () => {
                    const aspect = img.width / img.height;
                    setImageDims({ width: img.width, height: img.height, aspect });
                };
                img.src = base64;

                handleGeminiArchitect(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCanvasClick = (e) => {
        if (!e.point) return; // Fix: Prevent crash if click doesn't hit a 3D object

        if (mode === 'trace' || mode === 'mask') {
            const point = [e.point.x, e.point.y, e.point.z];
            setTempPoints([...tempPoints, point]);
        } else if (mode === 'measure') {
            const point = [e.point.x, e.point.y, e.point.z];
            if (measurePoints.length >= 2) {
                setMeasurePoints([point]); // Start new measurement
            } else {
                setMeasurePoints([...measurePoints, point]);
            }
        } else if (mode === 'place' && !selectedId && !e.delta) {
            // Place cabinet on clicked point if nothing is selected and it wasn't a drag
            // Access camera rotation via scene if needed, but easier to just use camera world direction
            const camera = e.target.getThree().camera;
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const angle = Math.atan2(dir.x, dir.z) + Math.PI; // Face opposite to camera direction

            addCabinet([e.point.x, e.point.y, e.point.z], [0, angle, 0]);
        }
    };

    const completeAction = () => {
        if (tempPoints.length >= 3) {
            if (mode === 'trace') {
                setSurfaces([...surfaces, { id: Date.now(), points: tempPoints }]);
            } else if (mode === 'mask') {
                setMasks([...masks, { id: Date.now(), points: tempPoints }]);
            }
            setTempPoints([]);
            setMode('place');
        }
    };

    const addCabinet = (position = [0, 0.45, 0], rotation = [0, 0, 0], type = 'base') => {
        let height = 0.9;
        if (type === 'upper') height = 0.8;
        if (type === 'pantry') height = 2.4;

        const newCabinet = {
            id: Date.now(),
            position: [position[0], position[1] + height / 2, position[2]],
            rotation: rotation,
            scale: [1, 1, 1],
            material: 'white',
            type: type
        };
        setCabinets([...cabinets, newCabinet]);
        setSelectedId(newCabinet.id);
        setMode('place');
    };

    const handleCabinetSync = (id, newProps) => {
        setCabinets(prev => prev.map(c => (c.id === id ? { ...c, ...newProps } : c)));
    };

    const handleMaterialChange = (id, material) => {
        setCabinets(prev => prev.map(c => c.id === id ? { ...c, material } : c));
    };

    const deleteCabinet = (id) => {
        setCabinets(cabinets.filter(c => c.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const duplicateCabinet = (cabinet) => {
        const newCabinet = {
            ...cabinet,
            id: Date.now(),
            position: [cabinet.position[0] + 1.1, cabinet.position[1], cabinet.position[2]],
        };
        setCabinets([...cabinets, newCabinet]);
        setSelectedId(newCabinet.id);
    };

    const generateAIKitchen = () => {
        if (surfaces.length === 0) {
            alert("Please trace at least one wall surface first!");
            return;
        }

        const targetSurface = selectedSurfaceId
            ? surfaces.find(s => s.id === selectedSurfaceId)
            : surfaces[0];

        if (!targetSurface) {
            alert("Please select a wall surface first!");
            return;
        }

        const newCabinets = [];
        const batchId = Date.now();
        const sIndex = surfaces.indexOf(targetSurface);

        const points = targetSurface.points;
        if (points.length < 2) return;

        // Calculate wall vector (from point 0 to point 1) and its normal
        const p0 = new THREE.Vector3(...points[0]);
        const p1 = new THREE.Vector3(...points[1]);
        const wallVector = new THREE.Vector3().subVectors(p1, p0);
        const wallLength = wallVector.length();
        const rotationY = Math.atan2(wallVector.x, wallVector.z) + Math.PI / 2;

        const cabinetWidth = 1.0;
        const count = Math.floor(wallLength / cabinetWidth);
        const minY = Math.min(...points.map(p => p[1]));

        for (let i = 0; i < count; i++) {
            const ratio = (i * cabinetWidth + cabinetWidth / 2) / wallLength;
            const interpolatedX = p0.x + wallVector.x * ratio;
            const interpolatedZ = p0.z + wallVector.z * ratio;

            // Base Cabinet (0.9m height)
            newCabinets.push({
                id: batchId + sIndex * 100 + i,
                position: [interpolatedX, minY + 0.45, interpolatedZ],
                rotation: [0, rotationY, 0],
                scale: [1, 1, 1],
                material: 'white',
                type: 'base'
            });

            // Upper Cabinet (0.8m height, placed 1.4m above floor)
            newCabinets.push({
                id: batchId + sIndex * 100 + i + 500,
                position: [interpolatedX, minY + 2.3, interpolatedZ],
                rotation: [0, rotationY, 0],
                scale: [1, 1, 1],
                material: 'white',
                type: 'upper'
            });
        }

        setCabinets(prev => [...prev, ...newCabinets]);
        setMode('place');
    };

    const handleLogout = () => {
        setWizardStep('selection');
        setRoomImage(null);
        setCabinets([]);
        setSurfaces([]);
        setMasks([]);
    };

    const unproject2Dto3D = (px, py, orientation = 'back', z = -4) => {
        const ndcx = (px / 50) - 1;
        const ndcy = 1 - (py / 50);

        const aspect = imageDims.aspect || 1;
        const vFovRad = (fov * Math.PI) / 180;
        const tanHalfFov = Math.tan(vFovRad / 2);

        // Camera is fixed at [0, 2, 10]
        const cameraZ = 10;
        const cameraY = 2;
        
        // Distance from camera to the plane
        // E.g., if wall is at z=-4, dist = 14
        let worldX, worldY, worldZ;

        if (orientation === 'left') {
            // Projected onto side wall plane
            worldZ = z + (ndcx + 1) * 3;
            const dist = cameraZ - worldZ;
            worldX = - (dist * tanHalfFov) * aspect; 
            worldY = cameraY + ndcy * (dist * tanHalfFov);
        } else if (orientation === 'right') {
            worldZ = z + (1 - ndcx) * 3;
            const dist = cameraZ - worldZ;
            worldX = (dist * tanHalfFov) * aspect;
            worldY = cameraY + ndcy * (dist * tanHalfFov);
        } else {
            // Back wall
            worldZ = z;
            const dist = cameraZ - worldZ;
            worldX = ndcx * (dist * tanHalfFov) * aspect;
            worldY = cameraY + ndcy * (dist * tanHalfFov);
        }

        return [worldX, worldY, worldZ];
    };

    const handleFillWall = (surfaceId) => {
        const target = surfaces.find(s => s.id === surfaceId);
        if (!target || !target.baseline) return;

        // --- NEW MIRACLE ALIGNMENT LOGIC ---
        // 1. Calculate World-Scale Positioning
        const { x1, x2, y: floorY } = target.baseline;
        const widthPercent = Math.abs(x2 - x1);
        const centerPercentX = (x1 + x2) / 2;

        // 2. Map 2D center to 3D World Position
        const worldPos = unproject2Dto3D(centerPercentX, floorY, target.orientation);
        
        // 3. Spacing calculation (Zero-Gap Tiling)
        const unitWidth = 0.8; // Standardized unit width in meters
        const vFovRad = (fov * Math.PI) / 180;
        const tanHalfFov = Math.tan(vFovRad / 2);
        const cameraZ = 10;
        const dist = cameraZ - worldPos[2];
        const totalWorldWidth = (widthPercent / 100) * (2 * dist * tanHalfFov * imageDims.aspect);

        const count = Math.max(1, Math.floor(totalWorldWidth / unitWidth));
        const stretchFactor = totalWorldWidth / (count * unitWidth); // Adjust to fill wall perfectly

        const newBatch = [];
        const batchId = Date.now();
        const orientationAngle = target.orientation === 'left' ? Math.PI / 2 
                             : target.orientation === 'right' ? -Math.PI / 2 
                             : 0;

        for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * unitWidth * stretchFactor;
            
            // Base Position
            let pos = [...worldPos];
            if (target.orientation === 'back') {
                pos[0] += offset;
            } else {
                pos[2] -= offset; // Side walls extend along Z
            }

            // A) Base Unit
            newBatch.push({
                id: batchId + i,
                position: [pos[0], pos[1], pos[2]],
                rotation: [0, orientationAngle, 0],
                scale: [stretchFactor, 1, 1], // Millimeter-perfect fit
                material: 'white',
                type: 'base'
            });

            // B) Upper Unit (Placed based on architectural standards)
            newBatch.push({
                id: batchId + i + 1000,
                position: [pos[0], pos[1] + 1.45, pos[2]],
                rotation: [0, orientationAngle, 0],
                scale: [stretchFactor, 1, 1],
                material: 'white',
                type: 'upper'
            });
        }

        setCabinets(prev => [...prev, ...newBatch]);
        
        // Feedback
        const wallLabel = target.orientation === 'left' ? 'Left Wall'
            : target.orientation === 'right' ? 'Right Wall'
                : 'Back Wall';
        setFillToast({ count: count * 2, wallName: wallLabel });
        setTimeout(() => setFillToast(null), 3500);
        setPendingWallId(null);
    };


    const handleGeminiArchitect = async (imgData) => {
        const base64 = imgData || roomImage;
        if (!base64) return;

        setWizardStep('dreaming');
        setError(null);

        try {
            const response = await api.post('/visualizer/architect', {
                image: base64.split(',')[1],
                intent: intent
            });

            if (response.data.success) {
                const { surfaces: rawSurfaces, masks: rawMasks, fov: newFov, lighting: newLighting } = response.data.data;

                setSurfaces(rawSurfaces || []);
                setMasks(rawMasks || []); // Precision Occlusion Masks
                setFov(newFov || 65);
                setLightingCondition(newLighting || 'natural');
                setWizardStep('visualizer');
                setMode('place'); // Skip 'align' - Detection is now 100% precise
            } else {
                throw new Error(response.data.error || "AI failed to analyze the room.");
            }
        } catch (error) {
            console.error("Gemini Architect Error:", error);
            setError(error.response?.data?.error || "Failed to analyze the room.");
            setWizardStep('upload');
        }
    };

    const selectedCabinet = useMemo(() => cabinets.find(c => c.id === selectedId), [selectedId, cabinets]);

    const handleSaveDesignData = async () => {
        const name = prompt("Enter a name for your design:", "My Design");
        if (!name) return;
        try {
            await api.post('/designs', { name, data: { cabinets, surfaces, masks, fov } });
            alert("Design saved successfully!");
        } catch (error) { console.error("Save error:", error); alert("Failed to save design."); }
    };

    const handleSampleMode = () => {
        // High-quality sample layout for testing when AI is offline
        const sampleSurfaces = [
            { id: 's1', name: "Back Wall", points: [[-6, 0, -5], [6, 0, -5], [6, 3, -5], [-6, 3, -5]] },
            { id: 's2', name: "Floor", points: [[-10, 0, 10], [10, 0, 10], [8, 0, -5], [-8, 0, -5]] }
        ];
        const sampleCabinets = [
            { id: 101, type: 'pantry', position: [-2.5, 1.2, -5], rotation: [0, 0, 0], scale: [1, 1, 1], material: 'navy' },
            { id: 102, type: 'base', position: [-1.5, 0.45, -5], rotation: [0, 0, 0], scale: [1, 1, 1], material: 'white' },
            { id: 103, type: 'base', position: [-0.5, 0.45, -5], rotation: [0, 0, 0], scale: [1, 1, 1], material: 'white' },
            { id: 104, type: 'upper', position: [-1.5, 2.3, -5], rotation: [0, 0, 0], scale: [1, 1, 1], material: 'white' },
            { id: 105, type: 'upper', position: [-0.5, 2.3, -5], rotation: [0, 0, 0], scale: [1, 1, 1], material: 'white' }
        ];
        setSurfaces(sampleSurfaces);
        setCabinets(sampleCabinets);
        setFov(60);
        setWizardStep('visualizer');
        setMode('place');
        setRoomImage('https://images.unsplash.com/photo-1556911220-e15224bbaf40?auto=format&fit=crop&q=80&w=2000'); // Professional empty kitchen
    };

    if (wizardStep === 'selection') return <WizardSelection setIntent={setIntent} setWizardStep={setWizardStep} handleSampleMode={handleSampleMode} />;
    if (wizardStep === 'upload') return <WizardUpload setWizardStep={setWizardStep} handleImageUpload={handleImageUpload} error={error} handleSampleMode={handleSampleMode} />;
    if (wizardStep === 'dreaming') return <DreamingOverlay />;

    return (
        <div className="visualizer-container">
            {/* UI Overlay: Left Toolbar */}
            <div className="visualizer-sidebar">
                <div className="sidebar-header">
                    <h2>Room Visualizer</h2>
                    <p>Align perspective and place cabinets</p>
                </div>

                <div className="sidebar-actions">
                    <label className="action-btn upload-btn">
                        <Upload size={18} />
                        Upload Photo
                        <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                    </label>

                    <button className="action-btn" onClick={addCabinet}>
                        <Plus size={18} />
                        Add Cabinet
                    </button>

                    <div className="control-group">
                        <label>Field of View (FOV)</label>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={fov}
                            onChange={(e) => setFov(parseInt(e.target.value))}
                        />
                        <span>{fov}┬░</span>
                    </div>

                    <div className="mode-toggles">
                        <button
                            className={`mode-btn ${mode === 'place' ? 'active' : ''}`}
                            onClick={() => setMode('place')}
                        >
                            <Plus size={18} /> Placement Mode
                        </button>
                        <button
                            className={`mode-btn ${mode === 'measure' ? 'active' : ''}`}
                            onClick={() => {
                                setMode('measure');
                                setMeasurePoints([]);
                            }}
                        >
                            <Ruler size={18} /> Measure
                        </button>
                    </div>

                    <button className="action-btn ai-btn gemini-btn" onClick={handleGeminiArchitect}>
                        <Sparkles size={18} />
                        Gemini AI Architect ≡ƒÆÄ
                    </button>

                    <button className="action-btn secondary" onClick={handleLoadDesign}>
                        <RotateCcw size={18} />
                        Load Saved Design
                    </button>

                    <button className="action-btn danger" onClick={handleClearAll}>
                        <Trash2 size={18} />
                        Clear Design
                    </button>

                    {(mode === 'trace' || mode === 'mask') && tempPoints.length > 0 && (
                        <button className="complete-btn" onClick={completeAction}>
                            Finish {mode === 'trace' ? 'Surface' : 'Mask'} ({tempPoints.length} pts)
                        </button>
                    )}

                </div>

                <div className="sidebar-instructions">
                    <h3><HelpCircle size={16} /> Instructions</h3>
                    <ul>
                        <li>1. Upload a photo of your room.</li>
                        <li>2. Wait for **Professional AI** to scan your walls.</li>
                        <li className="highlight-step"><strong>3. Click a green wall to auto-fill with cabinets.</strong></li>
                        <li>4. Use the toolbar to change colors and materials.</li>
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <button className="save-btn" onClick={handleSaveDesign}>
                        <Save size={18} />
                        Save Design
                    </button>
                </div>
            </div>

            {/* Main 3D Canvas */}
            {/* Main 3D Canvas Area */}
            <div className="canvas-wrapper">
                {!roomImage && (
                    <div className="upload-placeholder">
                        <Upload size={48} />
                        <h3>Start by uploading a room photo</h3>
                        <p>High-quality, well-lit photos work best.</p>
                    </div>
                )}

                {roomImage && (
                    <div
                        className="canvas-container"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: imageDims.aspect > (window.innerWidth - 320) / (window.innerHeight - 80) ? '100%' : 'auto',
                            height: imageDims.aspect > (window.innerWidth - 320) / (window.innerHeight - 80) ? 'auto' : '100%',
                            aspectRatio: imageDims.aspect,
                            maxHeight: '100%',
                            maxWidth: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="background-image" style={{
                            backgroundImage: `url(${roomImage})`,
                            zIndex: 1,
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            backgroundSize: '100% 100%'
                        }}>
                            {/* ENGINE V5: Pixel-Perfect Segmentation Highlights + Cabinet Fill */}
                            <SurfaceOverlay
                                surfaces={surfaces}
                                filledWalls={filledWalls}
                                selectedId={pendingWallId}
                                onSelect={(id) => {
                                    if (pendingWallId === id) {
                                        handleFillWall(id);
                                    } else {
                                        setPendingWallId(id);
                                        setSelectedSurfaceId(id);
                                    }
                                }}
                            />
                        </div>
                        <VisualizerErrorBoundary>
                            <Canvas
                                shadows
                                gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
                                onPointerMissed={() => setSelectedId(null)}
                                style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}
                            >
                                <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={fov} />

                                <OrbitControls
                                    ref={orbitRef}
                                    makeDefault
                                    enabled={false} // Permanently lock the scene for precision
                                    enableDamping={false}
                                />

                                <Environment preset={
                                    lightingCondition === 'warm' ? 'sunset' :
                                        lightingCondition === 'cool' ? 'city' : 'apartment'
                                } intensity={1.1} />

                                <ambientLight intensity={lightingCondition === 'cool' ? 0.3 : 0.6} />

                                <spotLight
                                    position={[10, 15, 10]}
                                    angle={0.25}
                                    penumbra={1}
                                    intensity={lightingCondition === 'warm' ? 5.0 : 4.0}
                                    color={lightingCondition === 'warm' ? '#ffeecc' : '#ffffff'}
                                    castShadow
                                    shadow-mapSize={[2048, 2048]}
                                    shadow-bias={-0.0001}
                                />

                                <directionalLight
                                    position={[-10, 8, 5]}
                                    intensity={2.0}
                                    color={lightingCondition === 'cool' ? '#ddeeaa' : '#ffffff'}
                                    castShadow
                                />

                                <pointLight
                                    position={[0, 5, -10]}
                                    intensity={1.5}
                                    color="#ffffff"
                                />

                                <ContactShadows
                                    position={[0, -4.5, 0]}
                                    opacity={0.65}
                                    scale={60}
                                    blur={1.5}
                                    far={5}
                                    resolution={1024}
                                />

                                {surfaces.map(s => (
                                    <Surface
                                        key={s.id}
                                        id={s.id}
                                        name={s.name}
                                        orientation={s.orientation}
                                        points={s.points}
                                        polygon={s.polygon}
                                        color={s.type === 'floor' ? '#EC4E15' : '#28a745'}
                                        opacity={0.3}
                                        imageAspect={imageDims.aspect}
                                        isSelected={selectedSurfaceId === s.id}
                                        onSelect={(id) => {
                                            if (pendingWallId === id) {
                                                handleFillWall(id);
                                            } else {
                                                setPendingWallId(id);
                                                setSelectedSurfaceId(id);
                                            }
                                        }}
                                    />
                                ))}
                                {masks.map(m => (
                                    <OcclusionMask
                                        key={m.id}
                                        polygon={m.polygon}
                                        zIndex={m.z_index}
                                        imageAspect={imageDims.aspect}
                                        fov={fov}
                                    />
                                ))}
                                {tempPoints.length > 0 && (
                                    mode === 'trace' ?
                                        <Surface points={tempPoints} color="#00ff00" opacity={0.3} onClick={handleCanvasClick} /> :
                                        <Surface points={tempPoints} color="#0088ff" opacity={0.3} onClick={handleCanvasClick} />
                                )}

                                {showGrid && !autoMode && (
                                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={handleCanvasClick}>
                                        <planeGeometry args={[100, 100]} />
                                        <meshBasicMaterial transparent opacity={0.1} color="#000" />
                                        <Grid
                                            infiniteGrid
                                            fadeDistance={30}
                                            fadeStrength={5}
                                            sectionSize={1}
                                            sectionThickness={1.5}
                                            sectionColor="#EC4E15"
                                            cellSize={0.5}
                                            cellThickness={0.5}
                                            cellColor="#666666"
                                        />
                                    </mesh>
                                )}

                                {(mode === 'trace' || mode === 'mask' || mode === 'place') && (
                                    <mesh
                                        rotation={[-Math.PI / 2, 0, 0]}
                                        position={[0, -0.05, 0]}
                                        onClick={handleCanvasClick}
                                        visible={false}
                                    >
                                        <planeGeometry args={[1000, 1000]} />
                                        <meshBasicMaterial transparent opacity={0} />
                                    </mesh>
                                )}

                                {measurePoints.length === 2 && (
                                    <group>
                                        <line>
                                            <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(measurePoints.map(p => new THREE.Vector3(...p)))} />
                                            <lineBasicMaterial attach="material" color="#EC4E15" linewidth={2} />
                                        </line>
                                        <mesh position={[
                                            (measurePoints[0][0] + measurePoints[1][0]) / 2,
                                            (measurePoints[0][1] + measurePoints[1][1]) / 2 + 0.1,
                                            (measurePoints[0][2] + measurePoints[1][2]) / 2
                                        ]}>
                                            <sphereGeometry args={[0.05]} />
                                            <meshBasicMaterial color="#EC4E15" />
                                        </mesh>
                                    </group>
                                )}

                                <Suspense fallback={null}>
                                    {cabinets.map((cabinet) => (
                                        <Cabinet
                                            key={cabinet.id}
                                            {...cabinet}
                                            isSelected={selectedId === cabinet.id}
                                            onSelect={() => setSelectedId(cabinet.id)}
                                        />
                                    ))}
                                </Suspense>

                                <ControlsHandler
                                    selectedId={selectedId}
                                    transformMode={transformMode}
                                    mode={mode}
                                    onMoveEnd={handleCabinetSync}
                                    orbitRef={orbitRef}
                                    cabinets={cabinets}
                                />
                            </Canvas>
                        </VisualizerErrorBoundary>
                    </div>
                )}

                {/* ΓöÇΓöÇΓöÇ WALL SELECTION CONFIRMATION PANEL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
                {pendingWallId && (() => {
                    const wall = surfaces.find(s => s.id === pendingWallId);
                    if (!wall) return null;
                    const orientLabel = wall.orientation === 'left' ? 'ΓåÉ Left Wall'
                        : wall.orientation === 'right' ? 'Right Wall ΓåÆ'
                            : wall.type === 'floor' ? 'Floor'
                                : 'Back Wall';
                    return (
                        <div className="wall-confirm-panel">
                            <div className="wall-confirm-icon">≡ƒÅá</div>
                            <div className="wall-confirm-info">
                                <strong>{orientLabel}</strong>
                                <span>selected ΓÇö ready to fill with cabinets</span>
                            </div>
                            <div className="wall-confirm-actions">
                                <button
                                    className="wall-confirm-btn fill"
                                    onClick={() => handleFillWall(pendingWallId)}
                                >
                                    Γ£ô Fill Wall
                                </button>
                                <button
                                    className="wall-confirm-btn cancel"
                                    onClick={() => setPendingWallId(null)}
                                >
                                    Γ£ò
                                </button>
                            </div>
                        </div>
                    );
                })()}

                {/* ΓöÇΓöÇΓöÇ FILL SUCCESS TOAST ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
                {fillToast && (
                    <div className="fill-toast">
                        <span className="fill-toast-icon">Γ£ô</span>
                        <span><strong>{fillToast.count}</strong> cabinets placed on <strong>{fillToast.wallName}</strong>. Click one to change material.</span>
                    </div>
                )}

                {/* Status Bar */}
                <div className="visualizer-status">
                    <div className="status-item">
                        <span className="dot" style={{ backgroundColor: mode === 'align' ? '#EC4E15' : '#28a745' }}></span>
                        Mode: <strong>{mode.charAt(0).toUpperCase() + mode.slice(1)}</strong>
                    </div>
                    {selectedId && (
                        <div className="status-item">
                            Selection: <strong>Cabinet {selectedId.toString().slice(-4)}</strong>
                        </div>
                    )}
                    <div className="status-item hints">
                        {mode === 'place' && "Click on surfaces to place cabinets. Drag to move."}
                        {mode === 'trace' && "Click to define wall/floor boundaries."}
                        {mode === 'mask' && "Trace objects in front of cabinets to hide them."}
                    </div>
                </div>

                {selectedId && (
                    <div className="selection-toolbar">
                        <div className="material-picker">
                            {['white', 'oak', 'walnut', 'grey', 'black', 'navy'].map(mat => (
                                <button
                                    key={mat}
                                    className={`mat-swatch ${mat} ${cabinets.find(c => c.id === selectedId)?.material === mat ? 'active' : ''}`}
                                    onClick={() => handleMaterialChange(selectedId, mat)}
                                    title={mat}
                                />
                            ))}
                        </div>
                        <div className="divider"></div>
                        <button
                            className={transformMode === 'translate' ? 'active' : ''}
                            onClick={() => setTransformMode('translate')}
                        >
                            <Move size={16} /> Move
                        </button>
                        <button
                            className={transformMode === 'rotate' ? 'active' : ''}
                            onClick={() => setTransformMode('rotate')}
                        >
                            <RotateCcw size={16} /> Rotate
                        </button>
                        <div className="divider"></div>
                        <button onClick={() => duplicateCabinet(cabinets.find(c => c.id === selectedId))} title="Duplicate">
                            <Plus size={16} /> Duplicate
                        </button>
                        <button onClick={() => deleteCabinet(selectedId)} className="delete-btn" title="Delete">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Visualizer;
