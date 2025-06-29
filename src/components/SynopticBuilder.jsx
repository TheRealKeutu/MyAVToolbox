import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';

const anchorOffsets = {
  top: { x: 50, y: 0 },
  bottom: { x: 50, y: 60 },
  left: { x: 0, y: 30 },
  right: { x: 100, y: 30 },
};

const getAnchorPosition = (shape, anchor) => ({
  x: shape.x + anchorOffsets[anchor].x,
  y: shape.y + anchorOffsets[anchor].y,
});

const getCenter = (shape) => ({
  x: shape.x + 50,
  y: shape.y + (shape.type === 'image' ? 50 : 30),
});

const getClosestAnchor = (fromShape, toShape) => {
  const fromCenter = getCenter(fromShape);
  const toCenter = getCenter(toShape);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
};

const snapToGrid = (value, gridSize = 20) => Math.round(value / gridSize) * gridSize;

export default function SynopticBuilder() {
  const [shapes, setShapes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const containerRef = useRef();
  const fileInputRef = useRef();
  const importInputRef = useRef();
  const [clipboard, setClipboard] = useState(null);


  const pushToHistory = () => {
    setUndoStack((prev) => [...prev, { shapes: [...shapes], connections: [...connections] }]);
    setRedoStack([]);
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setRedoStack(redoStack.slice(0, -1));
      setUndoStack([...undoStack, { shapes: [...shapes], connections: [...connections] }]);
      setShapes(next.shapes);
      setConnections(next.connections);
    }
  };

  const addBox = () => {
    pushToHistory();
    setShapes((prev) => [...prev, { id: uuidv4(), x: 100, y: 100, label: 'Élément', type: 'box' }]);
  };

  const addText = () => {
    pushToHistory();
    setShapes((prev) => [...prev, { id: uuidv4(), x: 100, y: 100, label: 'Texte', type: 'text' }]);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      pushToHistory();
      setShapes((prev) => [...prev, {
        id: uuidv4(),
        x: 100,
        y: 100,
        type: 'image',
        label: 'Image',
        src: event.target.result
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (id, x, y) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: snapToGrid(x), y: snapToGrid(y) } : s))
    );
  };

  const handleStartConnect = (id) => {
    setConnectingFrom(id);
  };

  const handleEndConnect = (id, isAlt = false) => {
    if (connectingFrom && connectingFrom !== id) {
      pushToHistory();
      setConnections((prev) => [
        ...prev,
        {
          id: uuidv4(),
          from: connectingFrom,
          to: id,
          alt: isAlt, // <- true pour la connexion alternative
        },
      ]);
    }
    setConnectingFrom(null);
  };

  const handleDeleteConnection = (id) => {
    pushToHistory();
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  };

  const handleDeleteShape = (id) => {
    pushToHistory();
    setShapes((prev) => prev.filter((s) => s.id !== id));
    setConnections((prev) => prev.filter((conn) => conn.from !== id && conn.to !== id));
  };

  const handleLabelChange = (id, newLabel) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: newLabel } : s))
    );
  };

  const handleExportPDF = () => {
    if (!containerRef.current) return;
    html2canvas(containerRef.current).then((canvas) => {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);
      pdf.save('synoptique.pdf');
    });
  };

  const handleSave = () => {
    const blob = new Blob(
      [JSON.stringify({ shapes, connections }, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'synoptique.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.shapes && data.connections) {
          pushToHistory();
          setShapes(data.shapes);
          setConnections(data.connections);
        }
      } catch (err) {
        alert("Erreur d'import : " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    pushToHistory();
    setShapes([]);
    setConnections([]);
  };

  const getOrthogonalPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    return Math.abs(end.x - start.x) > Math.abs(end.y - start.y)
      ? `M${start.x},${start.y} L${midX},${start.y} L${midX},${end.y} L${end.x},${end.y}`
      : `M${start.x},${start.y} L${start.x},${midY} L${end.x},${midY} L${end.x},${end.y}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac && e.metaKey && !e.shiftKey && e.key === 'z') ||
                     (!isMac && e.ctrlKey && !e.shiftKey && e.key === 'z');
      const isRedo = (isMac && e.metaKey && e.shiftKey && e.key === 'Z') ||
                     (!isMac && e.ctrlKey && e.shiftKey && e.key === 'Z');
      const isSave = (isMac && e.metaKey && e.key === 's') ||
                     (!isMac && e.ctrlKey && e.key === 's');
      const isCopy = (isMac && e.metaKey && e.key === 'c') ||
                    (!isMac && e.ctrlKey && e.key === 'c');
      const isPaste = (isMac && e.metaKey && e.key === 'v') ||
                      (!isMac && e.ctrlKey && e.key === 'v');               

      if (e.key === 'Backspace' && selectedId && editingId !== selectedId) {
        e.preventDefault();
        handleDeleteShape(selectedId);
        setSelectedId(null);
      }

      if (isUndo && undoStack.length > 0) {
        e.preventDefault();
        const last = undoStack[undoStack.length - 1];
        setUndoStack(undoStack.slice(0, -1));
        setRedoStack([...redoStack, { shapes: [...shapes], connections: [...connections] }]);
        setShapes(last.shapes);
        setConnections(last.connections);
      }

      if (isRedo && redoStack.length > 0) {
        e.preventDefault();
        handleRedo();
      }

      if (isSave) {
        e.preventDefault();
        handleSave();
      }

      if (isCopy && selectedId) {
        const shapeToCopy = shapes.find((s) => s.id === selectedId);
        if (shapeToCopy) {
          e.preventDefault();
          setClipboard({ ...shapeToCopy });
        }
      }

      if (isPaste && clipboard) {
        e.preventDefault();
        pushToHistory();
        const newShape = {
          ...clipboard,
          id: uuidv4(),
          x: clipboard.x + 20,
          y: clipboard.y + 20,
        };
        setShapes((prev) => [...prev, newShape]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, selectedId, editingId, shapes, connections]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>🧠 Créateur de Synoptique</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={addBox}>➕ Élément</button>
        <button onClick={addText}>📝 Texte</button>
        <button onClick={() => fileInputRef.current.click()}>🖼 Image</button>
        <input type="file" ref={fileInputRef} accept="image/*" onChange={addImage} style={{ display: 'none' }} />
        <button onClick={handleSave}>💾 Sauver</button>
        <button onClick={() => importInputRef.current.click()}>📂 Importer</button>
        <input type="file" ref={importInputRef} accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        <button onClick={handleExportPDF}>🧾 PDF</button>
        <button onClick={handleReset}>🗑 Réinitialiser</button>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setSelectedId(null)}
        style={{
          position: 'relative',
          width: '100%',
          height: '600px',
          backgroundColor: '#f9fafb',
          backgroundImage: `
            repeating-linear-gradient(to right, #e5e7eb 0 1px, transparent 1px 20px),
            repeating-linear-gradient(to bottom, #e5e7eb 0 1px, transparent 1px 20px)
          `,
          border: '1px solid #ccc',
        }}
      >
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          {connections.map((conn) => {
            const from = shapes.find((s) => s.id === conn.from);
            const to = shapes.find((s) => s.id === conn.to);
            if (!from || !to) return null;

            let fromPos = getAnchorPosition(from, getClosestAnchor(from, to));
            let toPos = getAnchorPosition(to, getClosestAnchor(to, from));

            // Décalage pour connexions secondaires
            if (conn.alt) {
              fromPos = { x: fromPos.x + 6, y: fromPos.y + 6 };
              toPos = { x: toPos.x + 6, y: toPos.y + 6 };
            }

            return (
              <g key={conn.id}>
                <path
                  d={getOrthogonalPath(fromPos, toPos)}
                  fill="none"
                  stroke={conn.alt ? 'Orange' : 'blue'}
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
                <circle
                  cx={(fromPos.x + toPos.x) / 2}
                  cy={(fromPos.y + toPos.y) / 2}
                  r={6}
                  fill="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnection(conn.id);
                  }}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                />
              </g>
            );
          })}
        </svg>

        {shapes.map((shape) => (
          <ShapeBox
            key={shape.id}
            {...shape}
            onDrag={handleDrag}
            onStartConnect={handleStartConnect}
            onEndConnect={handleEndConnect}
            editingId={editingId}
            setEditingId={setEditingId}
            onLabelChange={handleLabelChange}
            onDelete={handleDeleteShape}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        ))}
      </div>
    </div>
  );
}

function ShapeBox({
  id, x, y, type, label, src,
  onDrag, onStartConnect, onEndConnect,
  editingId, setEditingId, onLabelChange,
  selectedId, setSelectedId
}) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const parentRect = ref.current?.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      const newX = e.clientX - parentRect.left - offset.x;
      const newY = e.clientY - parentRect.top - offset.y;
      onDrag(id, newX, newY);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset, id, onDrag]);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        const rect = ref.current.getBoundingClientRect();
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setDragging(true);
        e.stopPropagation();
        setSelectedId(id);
      }}
      style={{
        position: 'absolute',
        top: y,
        left: x,
        backgroundColor: '#fff',
        padding: '6px',
        borderRadius: '8px',
        border: selectedId === id ? '2px solid orange' : '1px solid #ccc',
        minWidth: '100px',
        maxWidth: '200px',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      {type === 'image' && (
        <img src={src} alt="img" style={{ maxWidth: '100px', maxHeight: '100px' }} />
      )}

      {editingId === id ? (
        <input
          value={label}
          onChange={(e) => onLabelChange(id, e.target.value)}
          onBlur={() => setEditingId(null)}
          autoFocus
          style={{ width: '100%', fontSize: '0.9em' }}
        />
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setEditingId(id);
          }}
          style={{ textAlign: 'center', cursor: 'text', fontSize: '0.9em' }}
        >
          {label}
        </div>
      )}

      {(type === 'box' || type === 'image') && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
          <button
            title="Départ de liaison"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(id);
            }}
          >
            ➤
          </button>
          <button
            title="Arrivée de liaison (Alt pour liaison alternative)"
            onClick={(e) => {
              e.stopPropagation();
              const isAlt = e.altKey;
              onEndConnect(id, isAlt);
            }}
          >
            🎯
          </button>
        </div>
      )}
    </div>
  );
}

