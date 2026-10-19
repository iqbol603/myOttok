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

    const barColors = {
        TotalCyber: '#4c85b3',
        TotalOther: '#0463b3',
        TotalCyberMax: '#1b900a',
        TotalCyberPacket: '#066260',
        TotalCyberStart: '#2ec000',
        TotalEvo: '#ed0b0b',
        TotalMaxPacket: '#061162',
        TotalNewCyberOptic: '#0087dd',
        TotalStartPacket: '#1c6206',
    };
    const chartLabels = Object.keys(totals);
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Общая сумма (TJS)',
                data: chartLabels.map((key) => totals[key]?.total_discount_with_tax || 0),
                backgroundColor: chartLabels.map((key) => barColors[key] || '#4c85b3'),
                borderRadius: 6,
                maxBarThickness: 72,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 8, right: 12, bottom: 4, left: 4 },
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start' as const,
                labels: {
                    font: { size: 14 },
                    boxWidth: 14,
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${Number(context.parsed.y || 0).toLocaleString('ru-RU')} TJS`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 13 },
                    color: '#1d2430',
                    maxRotation: 40,
                    minRotation: 40,
                    autoSkip: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: { size: 13 },
                    color: '#415064',
                    callback: (value) => Number(value).toLocaleString('ru-RU'),
                },
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
                            <div className="chart-canvas">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
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
