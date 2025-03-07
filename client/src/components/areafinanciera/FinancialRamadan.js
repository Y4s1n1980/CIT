import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './FinancialRamadan.css';

const FinancialRamadan = () => {
  const [rows, setRows] = useState([]);
 
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    note: '',
    type: 'Ramadan' // Campo fijo para identificar el tipo de ingreso
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Total de Monto
  const totalAmount = rows.reduce((acc, row) => acc + parseFloat(row.amount || 0), 0);

  // Verificar si el usuario está autenticado
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
          const querySnapshot = await getDocs(collection(db, 'financialRamadan'));
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Agregar una nueva fila
  const handleAddRow = async () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar esta acción.');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'financialRamadan'), formData);
      setRows([...rows, { id: docRef.id, ...formData }]);
      setFormData({ name: '', amount: '', date: '', note: '', type: 'Ramadan' });
    } catch (e) {
      alert('Error añadiendo el documento: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Editar una fila
  const handleEditRow = async (id) => {
    const updatedRow = rows.find(row => row.id === id);
    try {
      await updateDoc(doc(db, 'financialRamadan', id), updatedRow);
      setRows([...rows]);
    } catch (e) {
      console.error('Error editando la fila: ', e);
    }
  };

  // Eliminar una fila
  const handleDeleteRow = async (id) => {
    try {
      await deleteDoc(doc(db, 'financialRamadan', id));
      setRows(rows.filter(row => row.id !== id));
    } catch (e) {
      console.error('Error eliminando la fila: ', e);
    }
  };

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
  
   // Calcular las filas actuales a mostrar
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

   // Función para cambiar de página
const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(rows.length / rowsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="financial-ramadan">
      <h2>Tabla Donaciones del Ramadán</h2>
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
      <td>{row.date ? new Date(row.date).toLocaleDateString() : "Fecha no disponible"}</td>
      <td>{row.note}</td>
      <td>
        <button onClick={() => handleEditRow(row.id)}>Editar</button>
        <button onClick={() => handleDeleteRow(row.id)}>Eliminar</button>
      </td>
    </tr>
  ))}
</tbody>


      </table>
      <div className="total-amount">
        Total Monto: {totalAmount.toFixed(2)}
      </div>

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
        <button className="add-row-button" onClick={handleAddRow} disabled={isLoading}>
          {isLoading ? 'Añadiendo...' : 'Añadir Fila'}
        </button>
      </div>
      <div className="pagination-ramadan">
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
        className={currentPage === index + 1 ? "active" : ""}
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

export default FinancialRamadan;
