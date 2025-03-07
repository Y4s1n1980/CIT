import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import "./FinancialSocios.css"; 

const FinancialSocios = () => {
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    note: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Calcular filas actuales
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  // Total de Monto
  const totalAmount = rows.reduce((acc, row) => acc + parseFloat(row.amount || 0), 0);

  // Verificar autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Cargar filas desde Firestore
  useEffect(() => {
    if (user) {
      const fetchRows = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'financialSocios'));
          const fetchedRows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRows(fetchedRows);
        } catch (e) {
          console.error('Error cargando los datos: ', e);
        }
      };
      fetchRows();
    }
  }, [user]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // 🆕 Agregar o actualizar fila
  const handleAddOrUpdateRow = async () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar esta acción.');
      return;
    }

    setIsLoading(true);

    try {
      if (editandoId) {
        // 🆕 Actualizar documento
        const docRef = doc(db, 'financialSocios', editandoId);
        await updateDoc(docRef, formData);
        setRows(rows.map(row => (row.id === editandoId ? { id: editandoId, ...formData } : row)));
        setEditandoId(null);
      } else {
        // 🆕 Agregar nuevo documento
        const docRef = await addDoc(collection(db, 'financialSocios'), formData);
        setRows([...rows, { id: docRef.id, ...formData }]);
      }

      setFormData({ name: '', amount: '', date: '', note: '' });
    } catch (e) {
      console.error('Error guardando los datos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Rellenar formulario con datos de edición
  const handleEditRow = (row) => {
    setFormData(row);
    setEditandoId(row.id);
  };

  // Eliminar una fila
  const handleDeleteRow = async (id) => {
    try {
      await deleteDoc(doc(db, 'financialSocios', id));
      setRows(rows.filter(row => row.id !== id));
    } catch (e) {
      console.error('Error eliminando la fila:', e);
    }
  };

  // Cambiar página
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(rows.length / rowsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="financial-socios">
      <h2>Donaciones Mensuales Socios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Nota</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.amount}</td>
              <td>
                {row.date ? new Date(row.date).toLocaleDateString(): ''}</td>
              <td>{row.note}</td>
              <td>
                <button onClick={() => handleEditRow(row)} className="edit-button">
                  Editar
                </button>

                <button onClick={() => handleDeleteRow(row.id)} className="delete-button">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-amount">Total Monto: {totalAmount.toFixed(2)}</div>

      {/* Formulario */}
      <div className="form">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Monto"
          value={formData.amount}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        <input
          type="text"
          name="note"
          placeholder="Nota"
          value={formData.note}
          onChange={handleChange}
        />
        <button onClick={handleAddOrUpdateRow} disabled={isLoading} className="add-row-button">
          {isLoading ? 'Añadiendo...' : 'Añadir Fila'}
        </button>
      </div>

      {/* Paginación */}
      <div className="pagination-socios">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        {Array.from({ length: Math.ceil(rows.length / rowsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(rows.length / rowsPerPage)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default FinancialSocios;
