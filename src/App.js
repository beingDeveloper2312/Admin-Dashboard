import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, InputBase, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { BiFirstPage, BiLastPage, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import './App.css';

const API_ENDPOINT = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

const App = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      setUsers(data.map(user => ({ ...user, visible: true, isEditing: false, selected: false })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const renderTable = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedUsers = users
      .filter(user => user.visible)
      .slice(startIndex, endIndex);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead className='table-head'>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectAllChecked}
                  onChange={selectAll}
                />
              </TableCell>
              <TableCell className='table-head'>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.map(user => (
              <TableRow key={user.id} className={user.selected ? 'selected-row' : ''}>
                <TableCell>
                  <Checkbox
                    checked={user.selected}
                    onChange={() => toggleSelect(user.id)}
                  />
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  {user.isEditing ? (
                    <TextField
                      value={user.name}
                      onChange={(e) => handleEditChange(user.id, 'name', e.target.value)}
                    />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>
                  {user.isEditing ? (
                    <TextField
                      value={user.email}
                      onChange={(e) => handleEditChange(user.id, 'email', e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  {user.isEditing ? (
                    <TextField
                      value={user.role}
                      onChange={(e) => handleEditChange(user.id, 'role', e.target.value)}
                    />
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>
                  {user.isEditing ? (
                    <>
                      <IconButton color="primary" onClick={() => saveUser(user.id)}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="default" onClick={() => cancelEdit(user.id)}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => editUser(user.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteUser(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(users.filter(user => user.visible).length / itemsPerPage);

    return (
      <div className="pagination">
        <IconButton onClick={() => goToPage(1)}>
          <BiFirstPage />
        </IconButton>
        <IconButton onClick={() => goToPage(currentPage - 1 > 0 ? currentPage - 1 : 1)}>
          <BiChevronLeft />
        </IconButton>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
          <IconButton
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            className={pageNumber === currentPage ? 'current-page' : ''}
          >
            {pageNumber}
          </IconButton>
        ))}
        <IconButton onClick={() => goToPage(currentPage + 1 <= totalPages ? currentPage + 1 : totalPages)}>
          <BiChevronRight />
        </IconButton>
        <IconButton onClick={() => goToPage(totalPages)}>
          <BiLastPage />
        </IconButton>
      </div>
    );
  };

  const search = () => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        return {
          ...user,
          visible: (
            user.id.includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
          ),
        };
      });
    });
    setCurrentPage(1);
  };

  const editUser = (userId) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isEditing: true };
        } else {
          return user;
        }
      });
    });
  };

  const saveUser = (userId) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isEditing: false };
        } else {
          return user;
        }
      });
    });
  };

  const deleteUser = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const deleteSelected = () => {
    setUsers(prevUsers => prevUsers.filter(user => !user.selected));
  };

  const deleteAll = () => {
    setUsers([]);
  };

  const toggleSelect = (userId) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, selected: !user.selected };
        } else {
          return user;
        }
      });
    });
  };

  const handleEditChange = (userId, field, value) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, [field]: value };
        } else {
          return user;
        }
      });
    });
  };

  const cancelEdit = (userId) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isEditing: false };
        } else {
          return user;
        }
      });
    });
  };

  const selectAll = () => {
    setSelectAllChecked(!selectAllChecked);
    setUsers(prevUsers => {
      return prevUsers.map((user, index) => {
        if (index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage) {
          return { ...user, selected: !selectAllChecked };
        } else {
          return user;
        }
      });
    });
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setSelectAllChecked(false);
  };

  return (
    <>
      <div className='head-container'>
        <div className="search-bar">
          <InputBase
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton onClick={search}>
            <SearchIcon />
          </IconButton>
        </div>

        <Button
          className='delete-all'
          color='error'
          onClick={deleteAll}
          startIcon={<DeleteIcon />}
        >
          Delete All
        </Button>
      </div>
    <div className="container">

      {renderTable()}

      {renderPagination()}

      <Button
        variant="contained"
        color='error'
        className='delete-selected'
        onClick={deleteSelected}
        startIcon={<DeleteIcon />}
      >
        Delete Selected
      </Button>
    </div>
    </>
  );
};

export default App;
