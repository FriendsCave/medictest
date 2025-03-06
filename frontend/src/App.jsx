import { useEffect, useState } from "react";
import axios from "axios";
import { Container, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Paper } from "@mui/material";
import { Delete, Edit, Logout } from "@mui/icons-material";

function App() {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ full_name: "", birth_date: "", card_number: "", diagnosis: "" });
  const [editingPatient, setEditingPatient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Вход в систему
  const login = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/api/token/", loginData)
      .then(response => {
        setToken(response.data.access);
        localStorage.setItem("token", response.data.access);
      })
      .catch(error => console.error("Ошибка входа", error));
  };

  // Выход из системы
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  // Загрузка пациентов
  useEffect(() => {
    if (token) {
      axios.get("http://127.0.0.1:8000/api/patients/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => setPatients(response.data))
        .catch(error => console.error("Ошибка загрузки", error));
    }
  }, [token]);

  // Добавление / редактирование пациента
  const savePatient = (e) => {
    e.preventDefault();
    if (!token) return;

    const method = editingPatient ? "put" : "post";
    const url = editingPatient
      ? `http://127.0.0.1:8000/api/patients/${editingPatient.id}/`
      : "http://127.0.0.1:8000/api/patients/";

    axios({
      method,
      url,
      data: newPatient,
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (editingPatient) {
          setPatients(patients.map(p => (p.id === editingPatient.id ? response.data : p)));
        } else {
          setPatients([...patients, response.data]);
        }
        setEditingPatient(null);
        setNewPatient({ full_name: "", birth_date: "", card_number: "", diagnosis: "" });
      })
      .catch(error => console.error("Ошибка сохранения", error));
  };

  // Удаление пациента
  const deletePatient = (id) => {
    axios.delete(`http://127.0.0.1:8000/api/patients/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setPatients(patients.filter(patient => patient.id !== id));
      })
      .catch(error => console.error("Ошибка удаления", error));
  };

  // Начать редактирование пациента
  const editPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({ full_name: patient.full_name, birth_date: patient.birth_date, card_number: patient.card_number, diagnosis: patient.diagnosis });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h4" align="center">Медицинская система</Typography>

        {!token ? (
          <>
            <Typography variant="h6" align="center">Вход</Typography>
            <form onSubmit={login}>
              <TextField fullWidth margin="normal" label="Имя пользователя" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required />
              <TextField fullWidth margin="normal" label="Пароль" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
              <Button type="submit" fullWidth variant="contained" color="primary">Войти</Button>
            </form>
          </>
        ) : (
          <>
            <Button onClick={logout} variant="contained" color="secondary" startIcon={<Logout />} style={{ marginBottom: 20 }}>Выйти</Button>

            <Typography variant="h6">Список пациентов</Typography>
            <List>
              {patients.map(patient => (
                <ListItem key={patient.id} divider>
                  <ListItemText primary={patient.full_name} secondary={patient.diagnosis} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => editPatient(patient)}><Edit /></IconButton>
                    <IconButton edge="end" onClick={() => deletePatient(patient.id)} color="error"><Delete /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Typography variant="h6">{editingPatient ? "Редактировать пациента" : "Добавить пациента"}</Typography>
            <form onSubmit={savePatient}>
              <TextField fullWidth margin="normal" label="ФИО" value={newPatient.full_name} onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })} required />
              <TextField fullWidth margin="normal" type="date" value={newPatient.birth_date} onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })} required />
              <TextField fullWidth margin="normal" label="Номер карты" value={newPatient.card_number} onChange={(e) => setNewPatient({ ...newPatient, card_number: e.target.value })} required />
              <TextField fullWidth margin="normal" label="Диагноз" value={newPatient.diagnosis} onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })} required />
              <Button type="submit" fullWidth variant="contained" color="primary">{editingPatient ? "Сохранить" : "Добавить"}</Button>
            </form>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;
