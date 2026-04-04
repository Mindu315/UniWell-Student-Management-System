/**
 * Admin Users Page
 * Manage all users (admin only)
 */

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { userAPI } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data.users);
        setFilteredUsers(response.data.data.users);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await userAPI.updateUser(userId, { role: newRole });
      if (response.data.success) {
        alert('User role updated successfully');
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await userAPI.deleteUser(userId);
        if (response.data.success) {
          alert('User deleted successfully');
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user._id,
      fullName: user.fullName,
      faculty: user.faculty,
      degreeProgram: user.degreeProgram,
      year: user.year,
      role: user.role
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        faculty: editingUser.faculty,
        degreeProgram: editingUser.degreeProgram,
        year: parseInt(editingUser.year),
        role: editingUser.role
      });
      if (response.data.success) {
        alert('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container dashboard-main unified-page-shell">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container dashboard-main unified-page-shell admin-page-shell">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage all registered users</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="user-count">
            Total Users: {filteredUsers.length}
          </div>
        </div>

        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit User</h2>
              <form onSubmit={handleUpdateUser} className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Faculty</label>
                  <input
                    type="text"
                    value={editingUser.faculty}
                    onChange={(e) => setEditingUser({...editingUser, faculty: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Degree Program</label>
                  <input
                    type="text"
                    value={editingUser.degreeProgram}
                    onChange={(e) => setEditingUser({...editingUser, degreeProgram: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={editingUser.year}
                    onChange={(e) => setEditingUser({...editingUser, year: e.target.value})}
                    required
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Student ID</th>
                <th>Faculty</th>
                <th>Year</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.studentId}</td>
                  <td>{user.faculty}</td>
                  <td>Year {user.year}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.fullName)}
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="no-data">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
