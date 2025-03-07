import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './FinancialUsers.css';

const FinancialUsers = () => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    role: '',
    dateAdded: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchRows = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'financialUsers'));
          const fetchedRows = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRows(fetchedRows);
        } catch (e) {
          console.error('Error cargando los datos: ', e);
        }
      };
      fetchRows();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };


  // 🆕 Agregar o actualizar usuario
  const handleAddOrUpdateUser = async () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar esta acción.');
      return;
    }
    setIsLoading(true);

    try {
      if (editandoId) {
        // 🆕 Actualizar usuario
        const userRef = doc(db, 'financialUsers', editandoId);
        await updateDoc(userRef, formData);
        setRows(rows.map(row => (row.id === editandoId ? { id: editandoId, ...formData } : row)));
        setEditandoId(null);
      } else {
        // 🆕 Agregar nuevo usuario
        const docRef = await addDoc(collection(db, 'financialUsers'), formData);
        setRows([...rows, { id: docRef.id, ...formData }]);
      }

      setFormData({ userName: '', email: '', role: '', dateAdded: '', status: '' });
    } catch (e) {
      alert('Error al guardar los datos: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Rellenar formulario con datos de edición
  const handleEditUser = (row) => {
    setFormData(row);
    setEditandoId(row.id);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, 'financialUsers', id));
      setRows(rows.filter((row) => row.id !== id));
    } catch (e) {
      console.error('Error eliminando la fila: ', e);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  return (
    <div className="financial-users">
      <h2>Tabla de Usuarios Financieros</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha alta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row) => (
            <tr key={row.id}>
              <td>{row.userName}</td>
              <td>{row.email}</td>
              <td>{row.role}</td>
              <td>{row.dateAdded ? new Date(row.dateAdded).toLocaleDateString() : ''}</td>
              <td>{row.status}</td>
              <td>
                <button className="edit-button" onClick={() => handleEditUser(row)}>Editar</button>
                <button onClick={() => handleDeleteUser(row.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      

      {/* Formulario */}
      <div className="form">
        <input
          type="text"
          name="userName"
          placeholder="Nombre de Usuario"
          value={formData.userName}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="role"
          placeholder="Rol"
          value={formData.role}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dateAdded"
          value={formData.dateAdded}
          onChange={handleChange}
        />
        <input
          type="text"
          name="status"
          placeholder="Estado"
          value={formData.status}
          onChange={handleChange}
        />
        <button onClick={handleAddOrUpdateUser} disabled={isLoading}>
          {isLoading ? 'Añadiendo...' : 'Añadir Usuario'}
        </button>
      </div>
      {/* Paginación */}
      <div className="pagination-usuarios">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FinancialUsers;  