import { useState, useEffect } from 'react';
import equipmentData from '../../assets/equipmentDB.json';
import cableSpecs from '../data/cableSpecs.json';

export default function PowerCalculator() {
  const [voltage, setVoltage] = useState(230);
  const [current, setCurrent] = useState('');
  const [power, setPower] = useState('');
  const [isThreePhase, setIsThreePhase] = useState(false);
  const [equipment, setEquipment] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [newPower, setNewPower] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPower, setEditPower] = useState('');
  const [customEquipments, setCustomEquipments] = useState([
    { category: 'lumière', name: '', power: 0, quantity: 1 }
  ]);
  const [cableLength, setCableLength] = useState('');
  const [cableSection, setCableSection] = useState('');
  const [cableCurrent, setCableCurrent] = useState('');

  useEffect(() => {
    const localData = localStorage.getItem('equipmentDB');
    if (localData) {
      setEquipment(JSON.parse(localData));
    } else {
      setEquipment(equipmentData);
    }
  }, []);

  useEffect(() => {
    // Ne déclenche le recalcul que si aucun courant manuel n'a été saisi
    if (cableCurrent !== '') return;

    const currentVal = parseFloat(calculateTotalCurrent());
    if (isNaN(currentVal)) return;

    let suggested = '';
    if (currentVal <= 10) suggested = 1.5;
    else if (currentVal <= 16) suggested = 2.5;
    else if (currentVal <= 25) suggested = 4;
    else if (currentVal <= 32) suggested = 6;
    else if (currentVal <= 40) suggested = 10;
    else suggested = 16;

    setCableCurrent(currentVal.toFixed(2));
  }, [customEquipments, voltage]);

  useEffect(() => {
    const currentVal = parseFloat(cableCurrent);
    if (isNaN(currentVal)) return;

    const suggested = suggestCableSectionFromCurrent(currentVal);
    setCableSection(suggested.toString());
  }, [cableCurrent]);

  const saveToLocalStorage = (data) => {
    localStorage.setItem('equipmentDB', JSON.stringify(data));
  };

  const parseNumber = (value) => parseFloat(value.replace(',', '.')) || 0;

  const suggestCableSectionFromCurrent = (current) => {
    if (current <= 10) return 1.5;
    if (current <= 16) return 2.5;
    if (current <= 25) return 4;
    if (current <= 32) return 6;
    if (current <= 40) return 10;
    if (current <= 63) return 16;
    if (current <= 80) return 25;
    if (current <= 100) return 35;
    return 50; // au-delà, mise en garde à ajouter ?
  };

  const handleChange = (type, value) => {
    if (type === 'voltage') setVoltage(value);
    else if (type === 'current') setCurrent(value);

    const v = parseNumber(type === 'voltage' ? value : voltage);
    const i = parseNumber(type === 'current' ? value : current);

    if (v && i) {
      setPower((v * i).toFixed(2));
    }
  };

  const calculateTotalPower = () =>
    customEquipments.reduce((total, eq) => total + (eq.quantity * eq.power), 0);

  const calculateTotalCurrent = () => {
    const totalPower = calculateTotalPower();
    const divisor = isThreePhase ? (Math.sqrt(3) * voltage) : voltage;
    return (totalPower / divisor).toFixed(2);
  };

  const calculatePowerDrop = () => {
    const length = parseFloat(cableLength);
    const current = parseFloat(cableCurrent);
    const section = parseFloat(cableSection);
    const spec = cableSpecs.power;
    const resistivity = spec.defaultResistivity || 0.0178; // ohm·mm²/m
    const voltageValue = parseFloat(voltage);
    const maxDrop = voltageValue * (spec.defaultMaxDropPercent || 5) / 100;

    if (isNaN(length) || isNaN(current) || isNaN(section) || section <= 0) return null;

    const drop = isThreePhase
      ? (Math.sqrt(3) * length * current * resistivity) / section
      : (2 * length * current * resistivity) / section;

    const percent = (drop / voltageValue) * 100;

    return {
      value: `${drop.toFixed(2)} V (${percent.toFixed(1)}%)`,
      warning: drop > maxDrop
        ? '⚠️ Chute de tension excessive, augmenter la section'
        : '✅ Chute de tension acceptable'
    };
  };

  const addCustomEquipment = () => {
    setCustomEquipments([...customEquipments, { category: 'lumière', name: '', power: 0, quantity: 1 }]);
  };

  const updateCustomEquipment = (index, key, value) => {
    const newList = [...customEquipments];
    newList[index][key] = key === 'quantity' || key === 'power' ? parseNumber(value) : value;

    if ((key === 'name' || key === 'category') && newList[index].category && newList[index].name) {
      const suggestion = equipment[newList[index].category]?.find(eq => eq.name === newList[index].name);
      if (suggestion) {
        newList[index].power = suggestion.power;
      }
    }

    setCustomEquipments(newList);
  };

  const removeCustomEquipment = (index) => {
    const newList = [...customEquipments];
    newList.splice(index, 1);
    setCustomEquipments(newList);
  };

  const addToDatabase = () => {
    const updated = { ...equipment };
    const newEntry = { name: newName, power: parseNumber(newPower) };
    if (!updated[newCategory]) updated[newCategory] = [];
    updated[newCategory].push(newEntry);
    setEquipment(updated);
    saveToLocalStorage(updated);
    setNewCategory('');
    setNewName('');
    setNewPower('');
  };

  const loss = calculatePowerDrop();

  return (
    <div className="content">
      <h1>⚡️ Électricité</h1>

      {/*<h2>🔌 Calculateur Puissance / Tension / Intensité</h2>
      <div className="buttonGroup">
        <label>Tension (V) :</label>
        <input type="number" value={voltage} onChange={(e) => handleChange('voltage', e.target.value)} />

        <label>Intensité (A) :</label>
        <input type="number" value={current} onChange={(e) => handleChange('current', e.target.value)} />

        <label>Puissance (W) :</label>
        <input type="number" value={power} readOnly />
      </div>*/}

      <hr />

      <h2>🧮 Consommation des équipements</h2>

      <button className="button" onClick={addCustomEquipment} style={{ marginTop: '1rem' }}>
        ➕ Ajouter un équipement
      </button>

      {customEquipments.map((eq, index) => (
        <div key={index} className="buttonGroup" style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <select
            value={eq.category}
            onChange={(e) => updateCustomEquipment(index, 'category', e.target.value)}
          >
            {Object.keys(equipment).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            list={`names-${index}`}
            value={eq.name}
            onChange={(e) => updateCustomEquipment(index, 'name', e.target.value)}
            placeholder="Nom de l'équipement"
          />
          <datalist id={`names-${index}`}>
            {equipment[eq.category]?.map((item, i) => (
              <option key={i} value={item.name} />
            ))}
          </datalist>

          <input
            type="number"
            placeholder="Puissance (W)"
            value={eq.power}
            onChange={(e) => updateCustomEquipment(index, 'power', e.target.value)}
          />

          <input
            type="number"
            placeholder="Qté"
            value={eq.quantity}
            onChange={(e) => updateCustomEquipment(index, 'quantity', e.target.value)}
          />

          <button className="button" onClick={() => removeCustomEquipment(index)}>❌</button>
        </div>
      ))}

      {customEquipments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>🔢 Résultats</h3>
          <p>Puissance totale : <strong>{calculateTotalPower()} W</strong></p>
          <p>Intensité requise : <strong>{calculateTotalCurrent()} A</strong></p>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h2>📏 Estimation de la section de câble</h2>

      <label>
        <input
          type="checkbox"
          checked={isThreePhase}
          onChange={() => setIsThreePhase(!isThreePhase)}
        />
        {' '}Triphasé
      </label>

      <div className="buttonGroup">
        <label>Longueur du câble (m) :</label>
        <input
          type="number"
          value={cableLength}
          onChange={(e) => setCableLength(e.target.value)}
        />

        <label>Intensité (A) :</label>
        <input
          type="number"
          value={cableCurrent}
          onChange={(e) => setCableCurrent(e.target.value)}
        />

        <label>Section (mm²) :</label>
        <input
          type="number"
          value={cableSection}
          onChange={(e) => setCableSection(e.target.value)}
        />

        {loss && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Chute de tension estimée :</strong> {loss.value}<br />
            <span style={{ color: loss.warning.includes('⚠️') ? 'red' : 'green' }}>{loss.warning}</span>
          </div>
        )}
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>📦 Ajouter un équipement à la base</h2>
      <div className="buttonGroup">
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="">-- Catégorie --</option>
          {Object.keys(equipment).map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          placeholder="Nom"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <input
          placeholder="Puissance (W)"
          type="number"
          value={newPower}
          onChange={(e) => setNewPower(e.target.value)}
        />

        <button className="button" onClick={() => {
          if (!newCategory || !newName || !newPower) {
            alert("Veuillez remplir tous les champs.");
            return;
          }
          addToDatabase();
        }}>
          Ajouter
        </button>
      </div>
    </div>
  );
}
