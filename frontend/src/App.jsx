import { useEffect, useState } from "react";
import axios from "axios";
import { Container, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Paper, InputAdornment } from "@mui/material";
import { Delete, Edit, Logout } from "@mui/icons-material";
import Calendar from 'react-calendar'; // Импортируем календарь
import 'react-calendar/dist/Calendar.css'; // Стили для календаря'
import { CalendarToday } from '@mui/icons-material';  // Импортируем иконку календаря



function App() {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ full_name: "", birth_date: "", card_number: "", diagnosis: "" });
  const [editingPatient, setEditingPatient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [searchTerm, setSearchTerm] = useState(""); // Для поиска
  const [filteredPatients, setFilteredPatients] = useState([]); // Для отображения отфильтрованных данных
  const [appointments, setAppointments] = useState([]); // Дни приёмов
  const [date, setDate] = useState(new Date()); // Текущая выбранная дата для календаря

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
    setToken("");  // Очищаем токен
    localStorage.removeItem("token");  // Удаляем токен из localStorage
    window.location.reload();  // Перезагружаем страницу, чтобы вернуть пользователя на страницу авторизации
  };

  // Загрузка пациентов
  useEffect(() => {
    if (token) {
      axios.get("http://127.0.0.1:8000/api/patients/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setPatients(response.data);
          setFilteredPatients(response.data); // Изначально показываем всех пациентов
        })
        .catch(error => console.error("Ошибка загрузки", error));
    }
  }, [token]);

  // Загрузка дней приёмов
  useEffect(() => {
    if (token) {
      axios.get("http://127.0.0.1:8000/api/appointments/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setAppointments(response.data);
        })
        .catch(error => console.error("Ошибка загрузки данных о приёмах", error));
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
        const newPatientData = response.data;

        // Обновляем состояние с новым пациентом
        setPatients(prevPatients => [...prevPatients, newPatientData]);
        setFilteredPatients(prevFilteredPatients => [...prevFilteredPatients, newPatientData]);

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
        setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
        setFilteredPatients(prevFilteredPatients => prevFilteredPatients.filter(patient => patient.id !== id));
      })
      .catch(error => console.error("Ошибка удаления", error));
  };

  // Начать редактирование пациента
  const editPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({ full_name: patient.full_name, birth_date: patient.birth_date, card_number: patient.card_number, diagnosis: patient.diagnosis });
  };

  // Обработчик поиска
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);

    const filtered = patients.filter((patient) =>
      patient.full_name.toLowerCase().includes(query) ||
      patient.diagnosis.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered); // Обновляем отфильтрованный список
  };

  // Обработчик изменения даты в календаре
  const onDateChange = (date) => {
    setDate(date);
  };

  // Функция для отображения, если день занят
  const tileClassName = ({ date, view }) => {
    const isAppointmentDay = appointments.some(appointment =>
      new Date(appointment.date).toDateString() === date.toDateString()
    );
  
    // Если день с приёмом, то добавляем специальный класс для выделения
    return isAppointmentDay ? 'highlight' : null;
  };
  const calendarStyles = `
  
`;

  // Условный рендеринг: если нет токена, показываем форму входа, иначе - основной интерфейс
  if (!token) {
    return (
      <Container maxWidth="sm" style={{ paddingTop: '50px' }}>
        <Typography variant="h4" align="center">Авторизация</Typography>
        <form onSubmit={login}>
          <TextField
            fullWidth
            margin="normal"
            label="Имя пользователя"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Пароль"
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
          
          <Button type="submit" fullWidth variant="contained" color="primary">
            Войти
          </Button>
        </form>
      </Container>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      {/* Кнопка "Выйти", расположенная вне контейнера */}
      <Button
        onClick={logout}
        variant="contained"
        color="secondary"
        startIcon={<Logout />}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10
        }}
      >
        Выйти
      </Button>
      
      {/* Список пациентов */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        <div style={{
          textAlign: 'center',
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          zIndex: 1
        }}>
          <Typography variant="h4" style={{ color: 'white', fontWeight: 'bold' }}>
            Медицинская система
          </Typography>
        </div>
        

        <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#fff' }}>
          <Typography variant="h6">Список пациентов</Typography>

          <TextField
            label="Поиск пациентов"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            margin="normal"
          />

          <List>
            {filteredPatients.map(patient => (
              <ListItem key={patient.id} divider>
                <ListItemText primary={patient.full_name} secondary={patient.diagnosis} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => editPatient(patient)}><Edit /></IconButton>
                  <IconButton edge="end" onClick={() => deletePatient(patient.id)} color="error"><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </div>

      {/* Календарь */}
      <div style={{ flex: 1 }}>
        <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#fff' }}>
          <Typography variant="h6">Календарь</Typography>
          <Calendar
            onChange={onDateChange}
            value={date}
            tileClassName={tileClassName}
          />
        </Paper>
      </div>

      {/* Форма добавления пациента */}
      <div style={{ flex: 1 }}>
        <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#fff' }}>
          <Typography variant="h6">{editingPatient ? "Редактировать пациента" : "Добавить пациента"}</Typography>
          <form onSubmit={savePatient}>
            <TextField fullWidth margin="normal" label="ФИО" value={newPatient.full_name} onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })} required />
            <TextField fullWidth margin="normal" type="date" value={newPatient.birth_date} onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })} required />
            <TextField fullWidth margin="normal" label="Номер карты" value={newPatient.card_number} onChange={(e) => setNewPatient({ ...newPatient, card_number: e.target.value })} required />
            <TextField fullWidth margin="normal" label="Диагноз" value={newPatient.diagnosis} onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })} required />
            <Button type="submit" fullWidth variant="contained" color="primary">{editingPatient ? "Сохранить" : "Добавить"}</Button>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default App;
