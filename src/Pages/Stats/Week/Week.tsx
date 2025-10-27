import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './Day.css';

const Week = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [totals, setTotals] = useState([]);  // Массив для итоговых данных

    // const [cyberData, setCyberData] = useState([]);
    // const [cyberMaxData, setCyberMaxData] = useState([]);

    useEffect(() => {
        const url = 'https://api.dashboard.btt.tj/api/data/last-week';  // URL вашего API
        const token = localStorage.getItem('token');  // Ваш Bearer токен

        const fetchData = async () => {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Bearer токен в заголовке
                    },
                });
                console.log("dataWeec", response);
                setData(response.data);  // Сохраняем данные в состояние
                const resultData = response.data;

                const newTotals = [];
                Object.keys(resultData).forEach((categoryKey) => {
                    if (!Array.isArray(resultData[categoryKey])) {
                        newTotals[categoryKey] = resultData[categoryKey];
                    }
                });

                setTotals(newTotals); // Сохраняем итоговые данные как объект


                console.log("dataWeec", response);
            } catch (error) {
                setError(error.message);  // Обработка ошибок
            }
        };

        fetchData();
    }, []);  // Пустой массив означает, что запрос выполняется один раз после монтирования компонента

    // console.log("total",totals);
    return (
        <div>
            {/* <div>
                <div className='today'>
                    <h1>За сегодня</h1>
                    <div className='Cyber'>
                        <div className='d-flex flex-wrap'> 
                            <h2>Cyber</h2>
                            {cyberData.map((item, index) => (
                                <div className='block m-4 p-4 border border-gray-300' key={index} style={{ minWidth: '200px' }}>
                                    <h3>{item.service_name || 'Cyber'}</h3>   
                                    <p>Абоненты: {item.subscriber_count || 0}</p>  
                                    <span>Сумма: {item.discount_with_tax || 0} </span>  
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='CyberMax'>
                        <div className='d-flex flex-wrap'>
                            <h2>CyberMax</h2>
                            {cyberMaxData.map((item, index) => (
                                <div className='block m-4 p-4 border border-gray-300' key={index} style={{ minWidth: '200px' }}>
                                    <h3>{item.service_name || 'Cyber'}</h3>   
                                    <p>Абоненты: {item.subscriber_count || 0}</p>  
                                    <span>Сумма: {item.discount_with_tax || 0}</span>  
                                </div>
                            ))}

                        </div>

                    </div>
                </div>

                {error && <div>Ошибка: {error}</div>}
                {data ? (
                    <pre>{JSON.stringify(data, null, 2)}</pre>  // Отображение данных
                ) : (
                    <div>Загрузка...</div>
                )}
            </div> */}
            <div className='today'>
                <h1>За неделю</h1>
                {data ? (
                    <>
                        {Object.keys(data).map((categoryKey, index) => {
                            const categoryData = data[categoryKey];

                            // Пропускаем общие данные (например, TotalCyber, TotalCyberMax)
                            // if (!Array.isArray(categoryData)) return null;
                            // Если это не массив, собираем итоговые данные
                            // Пропускаем итоговые данные (они будут рендериться отдельно)
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
                                    {/* {categoryData.map((item, i) => (
                                    <div className='block m-4 p-4 border border-gray-300' key={i} style={{ minWidth: '200px' }}>
                                        <h3>{item.service_name || categoryKey}</h3>   
                                        <p>Абоненты: {item.subscriber_count || 0}</p>  
                                        <span>Сумма: {item.discount_with_tax || 0}</span> 
                                    </div>
                                ))} */}
                                </div>
                            );

                        })}

                        {/* Отображение итоговых данных в конце */}
                        <div className=" totals">
                            <h4>Итоговые данные</h4>
                            <div className='d-flex flex-wrap'>
                                {Object.keys(totals).map((key, index) => (
                                    // <div key={index} className="total-item">
                                    //     <h3>{key}</h3>
                                    //     <p>Всего абонентов: {totals[key].total_subscriber}</p>
                                    //     <p>Общая сумма: {totals[key].total_discount_with_tax} TJS</p>
                                    // </div>

                                    <div className={`block ${key} m-4 p-4 border border-gray-300`} key={index} style={{ minWidth: '200px' }}>
                                        <h3>{key || 'Cyber'}</h3>   {/* Имя */}
                                        <p>Абоненты:<span>{totals[key].total_subscriber || 0}</span> </p>  {/* Абоненты */}
                                        <p>Сумма: <span>{totals[key].total_discount_with_tax || 0} TJS</span>  </p>  {/* Сумма */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>Загрузка...</div>
                )}
            </div>

            {/* {error && <div>Ошибка: {error}</div>}
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>  // Отображение данных
            ) : (
                <div>Загрузка...</div>
            )} */}
        </div>
    );
};

export default Week;
