import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './Ottok.css';

const TYPE_OPTIONS = [
    { value: 'ns_regular', label: 'Недостаточно средств' },
    { value: 'ns_lte', label: 'Недостаточно средств LTE' },
    { value: 'ns_to_pb_regular', label: 'Переход с НС на ПБ' },
    { value: 'ns_to_pb_lte', label: 'Переход с НС на ПБ LTE' },
    { value: 'pause_to_pb_regular', label: 'Переход с Паузы на ПБ' },
    { value: 'pause_to_pb_lte', label: 'Переход с Паузы на ПБ LTE' },
    { value: 'pause', label: 'Пауза' },
    { value: 'pb_regular', label: 'Платная блокировка' },
    { value: 'pb_lte', label: 'Платная блокировка LTE' },
    { value: 'dr_operator', label: 'Договор расторгнут (по инициативе Оператора)' },
    { value: 'dr_subscriber', label: 'Договор расторгнут (по инициативе Абонента)' },
];

const SUBTYPE_OPTIONS = [
    { value: 'not_juridical', label: 'Физические лица' },
    { value: 'juridical', label: 'Юридические лица' },
];

const REFRESH_MS = 5 * 60 * 1000;
const MAX_PERIOD_DAYS = 120;

type DetailRow = {
    account_id?: string | number;
    login?: string;
    block_date?: string;
};

type PeriodFilter = {
    dateFrom: string;
    dateTo: string;
    type: string;
    subtype: string;
};

const localDate = (date = new Date()) => {
    const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return copy.toISOString().slice(0, 10);
};

const formatDateForApi = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
};

const eachApiDate = (dateFrom: string, dateTo: string) => {
    const dates: string[] = [];
    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        return dates;
    }

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
        dates.push(formatDateForApi(localDate(cursor)));
    }
    return dates;
};

const toRows = (data: unknown): DetailRow[] => {
    if (!data) return [];
    const list = Array.isArray(data) ? data : Object.values(data as Record<string, DetailRow>);
    return list.filter((row): row is DetailRow => Boolean(row && typeof row === 'object'));
};

const labelOf = (options: { value: string; label: string }[], value: string) =>
    options.find((option) => option.value === value)?.label || value;

const downloadExcel = (filename: string, rows: string[][]) => {
    const headers = ['№', 'ЛС', 'Login', 'Дата', 'Тип', 'Категория'];
    const escapeCell = (value: string) =>
        String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    const head = headers.map((header) => `<th>${escapeCell(header)}</th>`).join('');
    const body = rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`)
        .join('');
    const html = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const Ottok = () => {
    const [currentMonthData, setCurrentMonthData] = useState<any>(null);
    const [previousMonthData, setPreviousMonthData] = useState<any>(null);
    const [allTimeData, setAllTimeData] = useState<any>(null);
    const [rows, setRows] = useState<DetailRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dateFrom, setDateFrom] = useState(localDate());
    const [dateTo, setDateTo] = useState(localDate());
    const [type, setType] = useState('ns_regular');
    const [subtype, setSubtype] = useState('not_juridical');
    const [loadingFilter, setLoadingFilter] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<string>('');
    const [applied, setApplied] = useState<PeriodFilter | null>(null);
    const filterRef = useRef<PeriodFilter | null>(null);

    const loadTables = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [currentMonthResponse, previousMonthResponse, allTimeResponse] = await Promise.all([
            axios.get('https://api.dashboard.btt.tj/api/detailing/this-month', { headers }),
            axios.get('https://api.dashboard.btt.tj/api/detailing/prev-month', { headers }),
            axios.get('https://api.dashboard.btt.tj/api/detailing/all-time', { headers }),
        ]);

        setCurrentMonthData(currentMonthResponse.data.data);
        setPreviousMonthData(previousMonthResponse.data.data);
        setAllTimeData(allTimeResponse.data.data);
        setUpdatedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    };

    const loadPeriod = async (filter: PeriodFilter) => {
        const dates = eachApiDate(filter.dateFrom, filter.dateTo);
        if (!dates.length) {
            setError('Дата «от» не может быть позже даты «до».');
            setRows([]);
            return;
        }
        if (dates.length > MAX_PERIOD_DAYS) {
            setError(`Период не больше ${MAX_PERIOD_DAYS} дней.`);
            setRows([]);
            return;
        }

        setLoadingFilter(true);
        setError(null);
        setApplied(filter);
        const token = localStorage.getItem('token');

        try {
            const responses = await Promise.all(
                dates.map((date) =>
                    axios.get('https://api.dashboard.btt.tj/api/detailing/details', {
                        params: { date, type: filter.type, subtype: filter.subtype },
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );

            const seen = new Set<string>();
            const nextRows: DetailRow[] = [];
            responses.forEach((response, index) => {
                toRows(response.data?.data).forEach((row) => {
                    const key = `${row.account_id || ''}|${row.login || ''}|${row.block_date || dates[index]}`;
                    if (seen.has(key)) return;
                    seen.add(key);
                    nextRows.push({
                        ...row,
                        block_date: row.block_date || dates[index],
                    });
                });
            });

            setRows(nextRows);
            setHasSearched(true);
        } catch (requestError: any) {
            setError(requestError?.response?.data?.message || requestError?.message || 'Не удалось загрузить период');
            setRows([]);
            setHasSearched(true);
        } finally {
            setLoadingFilter(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const refresh = async () => {
            try {
                await loadTables();
                if (!cancelled && filterRef.current) {
                    await loadPeriod(filterRef.current);
                }
            } catch (requestError: any) {
                if (!cancelled) {
                    setError(requestError?.response?.data?.message || requestError?.message || 'Не удалось обновить данные');
                }
            }
        };

        refresh();
        const intervalId = window.setInterval(refresh, REFRESH_MS);
        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, []);

    const handleFilterSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const filter = { dateFrom, dateTo, type, subtype };
        filterRef.current = filter;
        await loadPeriod(filter);
    };

    const exportExcel = () => {
        const source = applied || { dateFrom, dateTo, type, subtype };
        const typeLabel = labelOf(TYPE_OPTIONS, source.type);
        const subtypeLabel = labelOf(SUBTYPE_OPTIONS, source.subtype);
        const excelRows = rows.map((row, index) => [
            String(index + 1),
            String(row.account_id ?? ''),
            String(row.login ?? ''),
            String(row.block_date ?? ''),
            typeLabel,
            subtypeLabel,
        ]);
        downloadExcel(
            `ottok_${formatDateForApi(source.dateFrom)}_${formatDateForApi(source.dateTo)}.xls`,
            excelRows
        );
    };

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
        const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        const month = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const previousMonth = new Date(year, month + 1, 0);
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
            : today.getMonth();
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
    };

    const getNestedData = (data: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], data);
    };

    const renderTableRows = (data: any, keyPrefix: string, days: string[], isCurrentMonth: boolean): JSX.Element[] | null => {
        if (!data) return null;

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

    return (
        <div className="ottok-page">
            <header className="ottok-top">
                <div>
                    <a className="ottok-back" href="/stats">← Назад к статистике</a>
                    <h1>Выгрузка оттока</h1>
                    <p className="ottok-note">
                        Данные и токен обновляются каждые 5 минут
                        {updatedAt ? ` · последнее обновление ${updatedAt}` : ''}
                    </p>
                </div>
            </header>

            <section className="ottok-card">
                <form className="ottok-filters" onSubmit={handleFilterSubmit}>
                    <label>
                        <span>Дата от</span>
                        <input
                            type="date"
                            name="dateFrom"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        <span>Дата до</span>
                        <input
                            type="date"
                            name="dateTo"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        <span>Тип</span>
                        <select name="type" value={type} onChange={(event) => setType(event.target.value)} required>
                            {TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Категория</span>
                        <select name="subtype" value={subtype} onChange={(event) => setSubtype(event.target.value)}>
                            {SUBTYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <div className="ottok-actions">
                        <button className="btn-show" type="submit" disabled={loadingFilter}>
                            {loadingFilter ? 'Загрузка…' : 'Показать'}
                        </button>
                        <button className="btn-excel" type="button" onClick={exportExcel} disabled={!rows.length || loadingFilter}>
                            Экспорт в Excel
                        </button>
                    </div>
                </form>

                {error && <p className="ottok-error">{error}</p>}

                <div className="ottok-results">
                    <div className="ottok-results-head">
                        <h2>Результаты за период</h2>
                        {hasSearched && <span>{rows.length} записей</span>}
                    </div>
                    {!hasSearched && <p className="ottok-empty">Выберите период и нажмите «Показать».</p>}
                    {hasSearched && !loadingFilter && !rows.length && !error && (
                        <p className="ottok-empty">За выбранный период записей нет.</p>
                    )}
                    {rows.length > 0 && (
                        <div className="ottok-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>ЛС</th>
                                        <th>Login</th>
                                        <th>Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={`${row.account_id}-${row.login}-${row.block_date}-${index}`}>
                                            <td>{index + 1}</td>
                                            <td>{row.account_id || '—'}</td>
                                            <td>{row.login || '—'}</td>
                                            <td>{row.block_date || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section className="ottok-card">
                <h2>Данные за текущий месяц</h2>
                <div className="ottok-table-wrap ottok-calendar">
                    <table>
                        <colgroup>
                            <col className="ottok-type-col" />
                            {getDaysInMonth().map((day) => (
                                <col key={`col-${day}`} />
                            ))}
                        </colgroup>
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
            </section>

            <section className="ottok-card">
                <h2>Данные за предыдущий месяц</h2>
                <div className="ottok-table-wrap ottok-calendar">
                    <table>
                        <colgroup>
                            <col className="ottok-type-col" />
                            {getFullDaysInPreviousMonth().map((day) => (
                                <col key={`prev-col-${day}`} />
                            ))}
                        </colgroup>
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
            </section>

            <section className="ottok-card">
                <h2>Данные за всё время</h2>
                <div className="ottok-table-wrap ottok-all-time">
                    <table>
                        <thead>
                            <tr>
                                <th>Тип</th>
                                <th>Значение</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTimeData && Object.keys(allTimeMappings).map((key) => {
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
            </section>
        </div>
    );
};

export default Ottok;
