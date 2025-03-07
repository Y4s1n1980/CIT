import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './FinancialViernes.css';

const FinancialViernes = () => {
  const [rows, setRows] = useState([]);
  

 // Cambiar página
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    note: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // Verificar autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Cargar datos desde Firestore
  useEffect(() => {
    if (user) {
      const fetchRows = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'financialViernes'));
          const fetchedRows = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        const docRef = doc(db, 'financialViernes', editandoId);
        await updateDoc(docRef, formData);
        setRows(rows.map(row => (row.id === editandoId ? { id: editandoId, ...formData } : row)));
        setEditandoId(null);
      } else {
        // 🆕 Agregar nuevo documento
        const formattedData = {
          ...formData,
          date: formData.date ? new Date(formData.date) : null,
        };
        const docRef = await addDoc(collection(db, 'financialViernes'), formattedData);
        setRows([...rows, { id: docRef.id, ...formattedData }]);
      }

      setFormData({ name: '', amount: '', date: '', note: '', type: '' });
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
      await deleteDoc(doc(db, 'financialViernes', id));
      setRows(rows.filter((row) => row.id !== id));
    } catch (e) {
      console.error('Error eliminando la fila: ', e.message);
    }
  };

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

 // Calcular las filas actuales a mostrar
 const indexOfLastRow = currentPage * rowsPerPage;
 const indexOfFirstRow = indexOfLastRow - rowsPerPage;
 const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="financial-viernes">
      <h2>Tabla Aportaciones del Viernes</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Nota</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  {currentRows.map((row) => (
    <tr key={row.id}>
      <td>{row.name}</td>
      <td>{row.amount}</td>
      <td>
  {row.date ? new Date(row.date).toLocaleDateString() : ''}
</td>

      <td>{row.note}</td>
      <td>{row.type}</td>
      <td>
        <button className="edit-button" onClick={() => handleEditRow(row)}>Editar</button>
        <button onClick={() => handleDeleteRow(row.id)}>Eliminar</button>
      </td>
    </tr>
  ))}
</tbody>
      </table>

      {/* Total de Monto */}
      <div className="total-amount">
        Total Monto: {rows.reduce((acc, row) => acc + parseFloat(row.amount || 0), 0).toFixed(2)}
      </div>

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
        <input
          type="text"
          name="type"
          placeholder="Tipo"
          value={formData.type}
          onChange={handleChange}
        />
        <button onClick={handleAddOrUpdateRow} disabled={isLoading}>
          {isLoading ? 'Añadiendo...' : 'Añadir Fila'}
        </button>
      </div>
      {/* Paginación */}
<div className="pagination-viernes">
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Anterior
  </button>
  {Array.from(
    { length: Math.ceil(rows.length / rowsPerPage) },
    (_, index) => (
      <button
        key={index + 1}
        onClick={() => paginate(index + 1)}
        disabled={currentPage === index + 1}
      >
        {index + 1}
      </button>
    )
  )}
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

export default FinancialViernes;
