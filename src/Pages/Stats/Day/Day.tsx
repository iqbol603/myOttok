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
import './Day.css';
import { useNavigate } from 'react-router-dom';

// Регистрация компонентов Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



const Today = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [totals, setTotals] = useState([]);  // Массив для итоговых данных
    const [ottok, setOttok] = useState([]);  // Массив для итоговых данных

    const [terminated, setContract_terminated] = useState([]);  // Массив для итоговых данных
    const [lack_of_funds, setLack_of_funds] = useState([]);  // Массив для итоговых данных
    const [paid_block, setPaid_block] = useState([]);  // Массив для итоговых данных
    const [Weekterminated, setWeekContract_terminated] = useState([]);  // Массив для итоговых данных
    const [Weeklack_of_funds, setWeekLack_of_funds] = useState([]);  // Массив для итоговых данных
    const [Weekpaid_block, setWeekPaid_block] = useState([]);  // Массив для итоговых данных
    const [ThisMonthterminated, setThisMonthContract_terminated] = useState([]);  // Массив для итоговых данных
    const [ThisMonthlack_of_funds, setThisMonthLack_of_funds] = useState([]);  // Массив для итоговых данных
    const [ThisMonthpaid_block, setThisMonthPaid_block] = useState([]);  // Массив для итоговых данных
    const [PrevMonthterminated, setPrevMonthContract_terminated] = useState([]);  // Массив для итоговых данных
    const [PrevMonthlack_of_funds, setPrevMonthLack_of_funds] = useState([]);  // Массив для итоговых данных
    const [PrevMonthpaid_block, setPrevMonthPaid_block] = useState([]);  // Массив для итоговых данных
    const [AllTimeterminated, setAllTimeContract_terminated] = useState([]);  // Массив для итоговых данных
    const [AllTimelack_of_funds, setAllTimeLack_of_funds] = useState([]);  // Массив для итоговых данных
    const [AllTimepaid_block, setAllTimePaid_block] = useState([]);  // Массив для итоговых данных

    const navigate = useNavigate();  // Хук для перенаправления


    const refreshToken = () => {
        localStorage.clear();
        navigate('/');
    }

    useEffect(() => {
        const url = 'https://api.dashboard.btt.tj/api/data/today';  // URL вашего API
        const urlOttok = 'https://api.dashboard.btt.tj/api/connection-status/today';  // URL вашего API
        const urlWeekOttok = 'https://api.dashboard.btt.tj/api/connection-status/last-week';  // URL вашего API
        const urlThisMonthOttok = 'https://api.dashboard.btt.tj/api/connection-status/this-month';  // URL вашего API
        const urlPrevMonthOttok = 'https://api.dashboard.btt.tj/api/connection-status/prev-month';  // URL вашего API
        const urlAllTimeOttok = 'https://api.dashboard.btt.tj/api/connection-status/all-time';  // URL вашего API
        const token = localStorage.getItem('token');  // Ваш Bearer токен

        const fetchData = async () => {
            
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                setData(response.data);  // Сохраняем данные в состояние
                const resultData = response.data;
                const newTotals = {};
                Object.keys(resultData).forEach((categoryKey) => {
                    if (!Array.isArray(resultData[categoryKey])) {
                        newTotals[categoryKey] = resultData[categoryKey];
                    }
                });

                setTotals(newTotals); // Сохраняем итоговые данные как объект
                console.log("data", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };
        const fetchDataOttok = async () => {
            try {
                const response = await axios.get(urlOttok, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                setOttok(response.data.data);  // Сохраняем данные в состояние
                const resultData = response.data.data;
                // const newTotals = {};
                // Object.keys(resultData).forEach((categoryKey) => {
                //     if (!Array.isArray(resultData[categoryKey])) {
                //         newTotals[categoryKey] = resultData[categoryKey];
                //     }
                // });
                // contract_terminated
                // : 
                // {count: 11}
                // contract_terminated
                // : 
                // {count: 470}
                // contract_terminated
                // : 
                // {count: 35}
                setContract_terminated(resultData.contract_terminated.count); // Сохраняем итоговые данные как объект
                setLack_of_funds(resultData.lack_of_funds.not_juridical.count); // Сохраняем итоговые данные как объект
                setPaid_block(resultData.paid_block.count); // Сохраняем итоговые данные как объект
                console.log("dataOttok", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };
        const fetchWeekOttok = async () => {
            try {
                const response = await axios.get(urlWeekOttok, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                // setOttok(response.data.data);  // Сохраняем данные в состояние
                const resultData = response.data.data;
                // const newTotals = {};
                // Object.keys(resultData).forEach((categoryKey) => {
                //     if (!Array.isArray(resultData[categoryKey])) {
                //         newTotals[categoryKey] = resultData[categoryKey];
                //     }
                // });
                // contract_terminated
                // : 
                // {count: 11}
                // contract_terminated
                // : 
                // {count: 470}
                // contract_terminated
                // : 
                // {count: 35}
                setWeekContract_terminated(resultData.contract_terminated.count); // Сохраняем итоговые данные как объект
                setWeekLack_of_funds(resultData.lack_of_funds.not_juridical.count); // Сохраняем итоговые данные как объект
                setWeekPaid_block(resultData.paid_block.count); // Сохраняем итоговые данные как объект
                console.log("dataOttok", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };
        const fetchThisMonthOttok = async () => {
            try {
                const response = await axios.get(urlThisMonthOttok, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                // setOttok(response.data.data);  // Сохраняем данные в состояние
                const resultData = response.data.data;
                // const newTotals = {};
                // Object.keys(resultData).forEach((categoryKey) => {
                //     if (!Array.isArray(resultData[categoryKey])) {
                //         newTotals[categoryKey] = resultData[categoryKey];
                //     }
                // });
                // contract_terminated
                // : 
                // {count: 11}
                // contract_terminated
                // : 
                // {count: 470}
                // contract_terminated
                // : 
                // {count: 35}
                setThisMonthContract_terminated(resultData.contract_terminated.count); // Сохраняем итоговые данные как объект
                setThisMonthLack_of_funds(resultData.lack_of_funds.not_juridical.count); // Сохраняем итоговые данные как объект
                setThisMonthPaid_block(resultData.paid_block.count); // Сохраняем итоговые данные как объект
                console.log("dataOttok", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };
        const fetchPrevMonthOttok = async () => {
            try {
                const response = await axios.get(urlPrevMonthOttok, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                // setOttok(response.data.data);  // Сохраняем данные в состояние
                const resultData = response.data.data;
                // const newTotals = {};
                // Object.keys(resultData).forEach((categoryKey) => {
                //     if (!Array.isArray(resultData[categoryKey])) {
                //         newTotals[categoryKey] = resultData[categoryKey];
                //     }
                // });
                // contract_terminated
                // : 
                // {count: 11}
                // contract_terminated
                // : 
                // {count: 470}
                // contract_terminated
                // : 
                // {count: 35}
                setPrevMonthContract_terminated(resultData.contract_terminated.count); // Сохраняем итоговые данные как объект
                setPrevMonthLack_of_funds(resultData.lack_of_funds.not_juridical.count); // Сохраняем итоговые данные как объект
                setPrevMonthPaid_block(resultData.paid_block.count); // Сохраняем итоговые данные как объект
                console.log("dataOttok", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };
        const fetchAllTimeOttok = async () => {
            try {
                const response = await axios.get(urlAllTimeOttok, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("status", response.status);


                // setOttok(response.data.data);  // Сохраняем данные в состояние
                const resultData = response.data.data;
                // const newTotals = {};
                // Object.keys(resultData).forEach((categoryKey) => {
                //     if (!Array.isArray(resultData[categoryKey])) {
                //         newTotals[categoryKey] = resultData[categoryKey];
                //     }
                // });
                // contract_terminated
                // : 
                // {count: 11}
                // contract_terminated
                // : 
                // {count: 470}
                // contract_terminated
                // : 
                // {count: 35}
                setAllTimeContract_terminated(resultData.contract_terminated.count); // Сохраняем итоговые данные как объект
                setAllTimeLack_of_funds(resultData.lack_of_funds.not_juridical.count); // Сохраняем итоговые данные как объект
                setAllTimePaid_block(resultData.paid_block.count); // Сохраняем итоговые данные как объект
                console.log("AllTimeOttok", response.data);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
                if (error.status == "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };

        fetchData();
        fetchDataOttok();
        fetchWeekOttok();
        fetchThisMonthOttok();
        fetchPrevMonthOttok();
        fetchAllTimeOttok();
    }, []);  // Пустой массив означает, что запрос выполняется один раз после монтирования компонента

    // Подготовка данных для графика
    console.log("terrr", ottok);
    const chartData = {
        labels: Object.keys(totals), // Названия категорий
        datasets: [
            {
                label: 'Общая сумма (TJS)',
                data: Object.values(totals).map(item => item.total_discount_with_tax || 0), // Суммы по категориям
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                height: 500,
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
                <h1>За сегодня</h1>
                <div className={`d-block `}>
                    <h2></h2>
                    <div className='d-flex flex-wrap'>

                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Недостаточно средств</h3>
                            <p>Абоненты:<span>{lack_of_funds || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Платная блокировка</h3>
                            <p>Абоненты:<span>{paid_block || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Договор расторгнут</h3>
                            <p>Абоненты:<span>{terminated || 0}</span></p>
                        </div>
                        За неделю
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Недостаточно средств</h3>
                            <p>Абоненты:<span>{Weeklack_of_funds || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Платная блокировка</h3>
                            <p>Абоненты:<span>{Weekpaid_block || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Договор расторгнут</h3>
                            <p>Абоненты:<span>{Weekterminated || 0}</span></p>
                        </div>

                    </div>
                    <label>За этот месяц</label>
                    <div className='d-flex flex-wrap'>

                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Недостаточно средств</h3>
                            <p>Абоненты:<span>{ThisMonthlack_of_funds || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Платная блокировка</h3>
                            <p>Абоненты:<span>{ThisMonthpaid_block || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Договор расторгнут</h3>
                            <p>Абоненты:<span>{ThisMonthterminated || 0}</span></p>
                        </div>

                    </div>
                    <label>Отток за предыдущий месяц </label>
                    <div className='d-flex flex-wrap'>

                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Недостаточно средств</h3>
                            <p>Абоненты:<span>{PrevMonthlack_of_funds || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Платная блокировка</h3>
                            <p>Абоненты:<span>{PrevMonthpaid_block || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Договор расторгнут</h3>
                            <p>Абоненты:<span>{PrevMonthterminated || 0}</span></p>
                        </div>

                    </div>
                    <label>Отток за все время </label>
                    <div className='d-flex flex-wrap'>

                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Недостаточно средств</h3>
                            <p>Абоненты:<span>{AllTimelack_of_funds || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Платная блокировка</h3>
                            <p>Абоненты:<span>{AllTimepaid_block || 0}</span></p>
                        </div>
                        <div className={`block ottok m-4 p-4 border border-gray-300`} style={{ minWidth: '200px' }}>
                            <h3>Договор расторгнут</h3>
                            <p>Абоненты:<span>{AllTimeterminated || 0}</span></p>
                        </div>

                    </div>
                </div>

                {data ? (
                    <>
                        {Object.keys(data).map((categoryKey, index) => {
                            const categoryData = data[categoryKey];

                            if (!Array.isArray(categoryData)) {
                                return null;
                            }

                            return (
                                <div key={index} className={`d-block `}>
                                    <h2>{categoryKey}</h2>
                                    <div className='d-flex flex-wrap'>
                                        {categoryData.map((item, index) => (
                                            <div className={`block ${categoryKey} m-4 p-4 border border-gray-300`} key={index} style={{ minWidth: '200px' }}>
                                                <h3>{item.service_name || 'Cyber'}</h3>
                                                <p>Абоненты:<span>{item.subscriber_count || 0}</span></p>
                                                <p>Сумма: <span>{item.discount_with_tax || 0} TJS</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="totals">
                            <h4>Итоговые данные</h4>
                            <div className='d-flex flex-wrap'>
                                {Object.keys(totals).map((key, index) => (
                                    <div className={`block ${key} m-4 p-4 border border-gray-300`} key={index} style={{ minWidth: '200px' }}>
                                        <h3>{key || 'Cyber'}</h3>
                                        <p>Абоненты:<span>{totals[key].total_subscriber || 0}</span></p>
                                        <p>Сумма: <span>{totals[key].total_discount_with_tax || 0} TJS</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="total-sum">
                            <h4>Общая сумма:
                                <span>
                                    {Object.keys(totals).reduce((sum, key) => {
                                        return sum + (totals[key].total_discount_with_tax || 0);
                                    }, 0)} TJS
                                </span>
                            </h4>
                        </div>

                        {/* Добавляем график итоговых данных */}
                        {/* <div className="chart">
                            <h4>График итоговых данных</h4>
                            <Bar data={chartData} options={chartOptions} />
                        </div> */}
                    </>
                ) : (
                    <div>Загрузка...</div>
                )}
            </div>
        </div>
    );
};

export default Today;
