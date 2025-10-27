import React, { useEffect } from 'react';
import Today from './Day/Day.tsx';
import Week from './Week/Week.tsx';
import ThisMoth from './Week/Month/ThisMonth.tsx';
import PrevMoth from './Week/Month/PrevMonth.tsx';
import AllTime from './AllTime/AllTime.tsx';
import './Stats.css';

const Stats = () => {
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();  // Перезагрузка страницы
        }, 600000);  // Обновление каждые 5 минут (300000 миллисекунд)

        return () => clearInterval(interval);  // Очистка таймера при размонтировании компонента
    }, []);

        return (
            <div className='allStat'>
                <a href='/ottok'>Отток!</a>
                <Today/>
                <Week/>
                <ThisMoth/>
                <PrevMoth/>
                <AllTime/>
            </div>
        );
}

export default Stats;