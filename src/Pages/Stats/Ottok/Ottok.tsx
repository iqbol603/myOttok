import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Ottok.css';
import { useNavigate } from 'react-router-dom';

const Ottok = () => {
    const [currentMonthData, setCurrentMonthData] = useState(null);
    const [previousMonthData, setPreviousMonthData] = useState(null);
    const [allTimeData, setAllTimeData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();  // Хук для перенаправления
    const refreshToken = () => {
        localStorage.clear();
        navigate('/');
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const currentMonthResponse = await axios.get('https://api.dashboard.btt.tj/api/detailing/this-month', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const previousMonthResponse = await axios.get('https://api.dashboard.btt.tj/api/detailing/prev-month', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const allTimeResponse = await axios.get('https://api.dashboard.btt.tj/api/detailing/all-time', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setCurrentMonthData(currentMonthResponse.data.data);
                setPreviousMonthData(previousMonthResponse.data.data);
                console.log("current",currentMonthResponse.data.data);
                console.log("prevv",previousMonthResponse.data.data);
                setAllTimeData(allTimeResponse.data.data);
                console.log("dfdfd",allTimeResponse.data.data);
            } catch (error) {
                setError(error.message);
                if (error.status === "401") {
                    refreshToken();

                    console.log("eee", error.status);
                }
            }
        };

        fetchData();
    }, []);
    const formatDateForApi = (date) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };
    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const prevDate = e.target.date.value;
        const type = e.target.type.value;
        const subtype = e.target.subtype.value;
        const date = formatDateForApi(prevDate);

        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(`https://api.dashboard.btt.tj/api/detailing/details`, {
                params: {
                    date,
                    type,
                    subtype
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log("search",response.data);

            setFilteredData(response.data.data);
        } catch (error) {
            setError(error.message);
            if (error.status === "401") {
                refreshToken();

                console.log("eee", error.status);
            }
        }
    };

    const renderFilteredData = () => {
        if (!filteredData) return null;

        return (
            <div className="filtered-data-section search todayS">
                   
                <h1>Результаты фильтрации</h1>
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>ЛС</th>
                            {/* <th>Name</th> */}
                            <th>Login</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(filteredData).map((key, index) => (
                            <tr key={key} className='ns'>
                                <td>{index +1}</td>
                                <td>{filteredData[key]?.account_id || 'N/A'}</td>
                                <td>{filteredData[key]?.login || 'N/A'}</td>
                                {/* <td>{filteredData[key]?.full_name || 'N/A'}</td> */}
                                <td>{filteredData[key]?.block_date || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    // const getDaysInMonth = (): string[] => {
    //     const today = new Date();
    //     const days: string[] = [];
    //     const totalDays = today.getDate();
    //     for (let i = 1; i <= totalDays; i++) {
    //         days.push(i < 10 ? `0${i}` : `${i}`);
    //     }
    //     return days;
    // };

    // const getFullDaysInPreviousMonth = (): string[] => {
    //     const today = new Date();
    //     const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    //     const days: string[] = [];
    //     const totalDays = previousMonth.getDate();
    //     for (let i = 1; i <= totalDays; i++) {
    //         days.push(i < 10 ? `0${i}` : `${i}`);
    //     }
    //     return days;
    // };

    // const formatDate = (day: string, isCurrentMonth: boolean): string => {
    //     const today = new Date();
    //     const month = isCurrentMonth ? today.getMonth() + 1 : today.getMonth();
    //     const year = today.getFullYear();
    //     const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    //     return `${day}-${formattedMonth}-${year}`;
    // };

    const getDaysInMonth = (): string[] => {
        const today = new Date();
        const days: string[] = [];
        const totalDays = today.getDate();
        for (let i = 1; i <= totalDays; i++) {
            days.push(i < 10 ? `0${i}` : `${i}`);
        }
        return days;
    };
    
    const getFullDaysInPreviousMonth = (): string[] => {
        const today = new Date();
        // Корректируем переход на предыдущий год, если текущий месяц — январь
        const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        const month = today.getMonth() === 0 ? 11 : today.getMonth() - 1; // 11 = декабрь
        const previousMonth = new Date(year, month + 1, 0); // Последний день предыдущего месяца
        const days: string[] = [];
        const totalDays = previousMonth.getDate();
        for (let i = 1; i <= totalDays; i++) {
            days.push(i < 10 ? `0${i}` : `${i}`);
        }
        return days;
    };
    
    const formatDate = (day: string, isCurrentMonth: boolean): string => {
        const today = new Date();
        const month = isCurrentMonth
            ? today.getMonth() + 1
            : today.getMonth() === 0
            ? 12
            : today.getMonth(); // Обработка декабря
        const year = isCurrentMonth
            ? today.getFullYear()
            : today.getMonth() === 0
            ? today.getFullYear() - 1
            : today.getFullYear();
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        return `${day}-${formattedMonth}-${year}`;
    };
    

    const typeMappings = {
        ns: { label: 'Перешли на НС', path: 'lack_of_funds.regular', className: 'ns' },
        nsL: { label: 'Сейчас на НС', path: 'lack_of_funds.filtered_counts.regular', className: 'ns' },
        nsLte: { label: 'Сейчас на НС LTE', path: 'lack_of_funds.lte', className: 'nsLte' },
        nsLteД: { label: 'Сейчас на НС LTE', path: 'lack_of_funds.filtered_counts.lte', className: 'nsLte' },
        nsPb: { label: 'Переход с НС на ПБ', path: 'ns_to_payed_block.regular', className: 'nsPb' },
        pausePb: { label: 'Переход с Паузы на ПБ', path: 'pause_to_payed_block.regular', className: 'pause' },
        pausePbLte: { label: 'Переход с Паузы на ПБ LTE', path: 'pause_to_payed_block.lte', className: 'pause' },
        pause: { label: 'Пауза', path: 'pause', className: 'pause-row' },
        block: { label: 'Платная блокировка', path: 'paid_block.regular', className: 'block' },
        blockLte: { label: 'Платная блокировка LTE', path: 'paid_block.lte', className: 'blockLte' },
        terminated: { label: 'Договор расторгнут (по инициативе Оператора)', path: 'contract_terminated.by_operator', className: 'terminated' },
        terminatedClient: { label: 'Договор расторгнут (по инициативе Абонента)', path: 'contract_terminated.by_subscriber', className: 'terminatedClient' }
    };

    const allTimeMappings = {
        pause: { label: 'Пауза', key: 'pause' },
        drSubscriber: { label: 'Договор расторгнут (по инициативе Абонента)', key: 'dr_subscriber' },
        drOperator: { label: 'Договор расторгнут (по инициативе Оператора)', key: 'dr_operator' },
        pbRegular: { label: 'Платная блокировка', key: 'paid_block' },
        // pbLte: { label: 'Платная блокировка LTE', key: 'pb_lte' }
    };

    const getNestedData = (data: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], data);
    };

    const renderTableRows = (data: any, keyPrefix: string, days: string[], isCurrentMonth: boolean): JSX.Element[] | null => {
        if (!data) return null;
console.log("test",isCurrentMonth);
        return Object.keys(typeMappings).map((typeKey) => {
            const { label, path, className } = typeMappings[typeKey];
            const dailyData = getNestedData(data, path) || {};

            return (
                <tr key={`${keyPrefix}-${typeKey}`} className={className}>
                    <td>{label}</td>
                    {days.map((day) => (
                        <td key={`${keyPrefix}-${day}`}>
                            {dailyData[formatDate(day, isCurrentMonth)]?.not_juridical || dailyData[formatDate(day, isCurrentMonth)]?.count || 0}
                        </td>
                    ))}
                </tr>
            );
        });
    };

    console.log("pre",previousMonthData);

    const renderAllTimeTable = () => {
        if (!allTimeData) return null;

        return (
            <div className="all-time-section">
                <h1>Данные за всё время</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Тип</th>
                            <th>Значение</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(allTimeMappings).map((key) => {
                            const { label, key: dataKey } = allTimeMappings[key];
                            return (
                                <tr key={dataKey}>
                                    <td>{label}</td>
                                    <td>{allTimeData[dataKey]?.total || 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            {error && <p>Error: {error}</p>}
     

            <div>
            <a href='/stats'>Назад</a>
                <h2>Выгрузка</h2>
                <div className='search'>
                <form onSubmit={handleFilterSubmit}>
                    <input type="date" name="date" id="date" placeholder='Выберите дату'required />
                    <select name="type" id="type" required>
                        <option value="ns_regular">Недостаточно Средств</option>
                        <option value="ns_lte">Недостаточно Средств LTE</option>
                        <option value="ns_to_pb_regular">Переход с НС на ПБ</option>
                        <option value="ns_to_pb_lte">Переход с НС на ПБ LTE</option>
                        <option value="pause_to_pb_regular">Переход с Паузы на ПБ</option>
                        <option value="pause_to_pb_lte">Переход с Паузы на ПБ LTE</option>
                        <option value="pause">Пауза</option> 
                        <option value="pb_regular">Платная блокировка</option>
                        <option value="pb_lte">Платная блокировка LTE</option>
                        <option value="dr_operator">Договор расторгнут (по инициативе Оператора)</option>
                        <option value="dr_subscriber">Договор расторгнут (по инициативе Абонента)</option>
                    </select>
                    <select name="subtype" id="subtype">
                        <option value="not_juridical" selected> Физические лица</option>
                        <option value="juridical">Юридические лица</option>
                        
                    </select>

                    <button type="submit">Показать</button>
                    </form>
                    {renderFilteredData()}
                </div>
            </div>

            <div className="month-section todayS">
                <h1>Данные за текущий месяц</h1>
                <div className={`d-flex flex-wrap justify-content-center`}>

                    <table>
                        <thead>
                            <tr>
                                <th>Тип</th>
                                {getDaysInMonth().map((day) => (
                                    <th key={`day-${day}`}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableRows(currentMonthData, 'current', getDaysInMonth(), true)}
                        </tbody>
                    </table>

                </div>
            </div>

            <div className="month-section todayS">
                <h1>Данные за предыдущий месяц</h1>
                <div className={`d-flex flex-wrap justify-content-center`}>
                    <div className='d-flex flex-wrap'>
                        <div>
                            <div className='allDays'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Тип</th>
                                            {getFullDaysInPreviousMonth().map((day) => (
                                                <th key={`prev-day-${day}`}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTableRows(previousMonthData, 'previous', getFullDaysInPreviousMonth(), false)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {renderAllTimeTable()}
            </div>
        </div>
    );
};

export default Ottok;
