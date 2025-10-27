import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';  // Импортируем Bar из react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';  // Импортируем необходимые компоненты из chart.js

// import './Day.css';

// Регистрация компонентов Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AllTime = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [totals, setTotals] = useState([]);  // Массив для итоговых данных

    // const [cyberData, setCyberData] = useState([]);
    // const [cyberMaxData, setCyberMaxData] = useState([]);

    useEffect(() => {
        const url = 'https://api.dashboard.btt.tj/api/data/all-time';  // URL вашего API
        const token = localStorage.getItem('token');  // Ваш Bearer токен

        const fetchData = async () => {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });

                setData(response.data);  // Сохраняем данные в состояние
                const resultData = response.data;

                const newTotals = [];
                Object.keys(resultData).forEach((categoryKey) => {
                    if (!Array.isArray(resultData[categoryKey])) {
                        newTotals[categoryKey] = resultData[categoryKey];
                    }
                });

                setTotals(newTotals); // Сохраняем итоговые данные как объект


                console.log("data", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
            }
        };

        fetchData();
    }, []);  // Пустой массив означает, что запрос выполняется один раз после монтирования компонента

    // console.log("total",totals);

    // Подготовка данных для графика
    const chartData = {
        labels: Object.keys(totals), // Названия категорий
        datasets: [
            {
                label: 'Общая сумма (TJS)',
                data: Object.values(totals).map(item => item.total_discount_with_tax || 0), // Суммы по категориям
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                height:500,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };


    return (
        <div>
           
            <div className='today'>
                <h1>За все время </h1>
                {data ? (
                    <>
                        {Object.keys(data).map((categoryKey, index) => {
                            const categoryData = data[categoryKey];
                            if (!Array.isArray(categoryData)) {
                                return null;
                            }


                            return (
                                <div key={index} className={`d-block flex-wrap`}>
                                     <h2>{categoryKey}</h2>
                                    <div className='d-flex flex-wrap'> {/* Используем flex и flex-wrap для размещения блоков */}
                                       
                                        {categoryData.map((item, index) => (
                                            <div className={`block ${categoryKey} m-4 p-4 border border-gray-300`} key={index} style={{ minWidth: '200px' }}>
                                                <h3>{item.service_name || 'Cyber'}</h3>   {/* Имя */}
                                                <p>Абоненты:<span>{item.subscriber_count || 0}</span> </p>  {/* Абоненты */}
                                                <p>Сумма: <span>{item.discount_with_tax || 0} TJS</span>  </p>  {/* Сумма */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        })}

                        {/* Отображение итоговых данных в конце */}
                        <div className=" totals">
                            <h4>Итоговые данные</h4>
                            <div className='d-flex flex-wrap'>
                                {Object.keys(totals).map((key, index) => (

                                    <div className={`block ${key} m-4 p-4 border border-gray-300`} key={index} style={{ minWidth: '200px' }}>
                                        <h3>{key || 'Cyber'}</h3>   {/* Имя */}
                                        <p>Абоненты:<span>{totals[key].total_subscriber || 0}</span> </p>  {/* Абоненты */}
                                        <p>Сумма: <span>{totals[key].total_discount_with_tax || 0} TJS</span>  </p>  {/* Сумма */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Добавляем график итоговых данных */}
                        <div className="chart">
                            <h4>График итоговых данных</h4>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </>
                ) : (
                    <div>Загрузка...</div>
                )}
            </div>
        </div>
    );
};

export default AllTime;
