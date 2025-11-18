
import React, { useState, useMemo, FC, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { 
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    writeBatch,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDUpl_RYef0WO0XG8n8fDu7t0tXtAUlo_w",
  authDomain: "tl2-fantasy-game.firebaseapp.com",
  projectId: "tl2-fantasy-game",
  storageBucket: "tl2-fantasy-game.firebasestorage.app",
  messagingSenderId: "805681675186",
  appId: "1:805681675186:web:ce75f9516bfbfcc20a42ab",
  measurementId: "G-CKBMBR3RKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- Data Interfaces ---
interface Driver {
    id: number;
    name: string;
    price: number;
    points: number;
}

interface Constructor {
    id: number;
    name: string;
    price: number;
    points: number;
}

interface Team {
    drivers: number[]; // Store by ID
    constructors: number[]; // Store by ID
}

// User represents the fantasy team in the league
interface User {
    name: string; // This is the Team Name
    team: Team;
    weekendPoints: number;
    championshipPoints: number;
}

interface RaceResult {
    userName: string; // This is the Team Name
    weekendPoints: number;
    championshipPointsAwarded: number;
}

interface RaceWeekend {
    id: number;
    name: string;
    results: RaceResult[];
}

// Account for login
interface Account {
    username: string;
    password: string;
    teamName: string | null;
}


// --- Initial Data ---
const initialDrivers: Driver[] = [
    { id: 1, name: 'Max Verstappen', price: 30.0, points: 0 },
    { id: 2, name: 'Sergio Pérez', price: 18.0, points: 0 },
    { id: 3, name: 'Charles Leclerc', price: 21.0, points: 0 },
    { id: 4, name: 'Carlos Sainz', price: 20.0, points: 0 },
    { id: 5, name: 'Lando Norris', price: 22.0, points: 0 },
    { id: 6, name: 'Oscar Piastri', price: 19.0, points: 0 },
    { id: 7, name: 'Lewis Hamilton', price: 25.0, points: 0 },
    { id: 8, name: 'George Russell', price: 23.0, points: 0 },
    { id: 9, name: 'Fernando Alonso', price: 15.0, points: 0 },
    { id: 10, name: 'Lance Stroll', price: 9.0, points: 0 },
    { id: 11, name: 'Pierre Gasly', price: 8.0, points: 0 },
    { id: 12, name: 'Esteban Ocon', price: 8.0, points: 0 },
    { id: 13, name: 'Yuki Tsunoda', price: 7.5, points: 0 },
    { id: 14, name: 'Daniel Ricciardo', price: 7.0, points: 0 },
    { id: 15, name: 'Valtteri Bottas', price: 6.0, points: 0 },
    { id: 16, name: 'Zhou Guanyu', price: 5.5, points: 0 },
    { id: 17, name: 'Alexander Albon', price: 8.5, points: 0 },
    { id: 18, name: 'Logan Sargeant', price: 5.0, points: 0 },
    { id: 19, name: 'Kevin Magnussen', price: 6.5, points: 0 },
    { id: 20, name: 'Nico Hülkenberg', price: 7.0, points: 0 },
];

const initialConstructors: Constructor[] = [
    { id: 1, name: 'Red Bull Racing', price: 28.0, points: 0 },
    { id: 2, name: 'Ferrari', price: 24.0, points: 0 },
    { id: 3, name: 'McLaren', price: 25.0, points: 0 },
    { id: 4, name: 'Mercedes', price: 26.0, points: 0 },
    { id: 5, name: 'Aston Martin', price: 14.0, points: 0 },
    { id: 6, name: 'Alpine', price: 9.0, points: 0 },
    { id: 7, name: 'RB', price: 8.0, points: 0 },
    { id: 8, name: 'Sauber', price: 6.0, points: 0 },
    { id: 9, name: 'Williams', price: 7.0, points: 0 },
    { id: 10, name: 'Haas', price: 6.5, points: 0 },
];

const CHAMPIONSHIP_POINTS_MAP = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const BUDGET = 110;

// --- Helper Hook for Session Storage ---
function useSessionStorageState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.sessionStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => {
        if (value === null || value === undefined) {
            window.sessionStorage.removeItem(key);
        } else {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);
    return [value, setValue];
}


// --- Components ---

const PermissionErrorScreen: FC = () => (
    <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Acesso Bloqueado ao Banco de Dados</h2>
        <p style={{ marginBottom: '1rem' }}>O aplicativo não tem permissão para acessar o Firebase. Isso geralmente ocorre quando as regras de segurança do Firestore estão bloqueadas.</p>
        <div style={{ marginTop: '1.5rem', textAlign: 'left', background: '#333', padding: '1.5rem', borderRadius: '8px' }}>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>Como corrigir:</strong>
            <ol style={{ marginLeft: '1.5rem', marginTop: '1rem', lineHeight: '1.6' }}>
                <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" style={{ color: 'var(--primary-color)' }}>Console do Firebase</a>.</li>
                <li>Selecione seu projeto <strong>tl2-fantasy-game</strong>.</li>
                <li>No menu lateral, vá em <strong>Criação &gt; Firestore Database</strong>.</li>
                <li>Clique na aba <strong>Regras</strong>.</li>
                <li>Substitua todo o código existente pelo código abaixo:</li>
            </ol>
            <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '4px', marginTop: '1rem', overflowX: 'auto', border: '1px solid #555', color: '#0f0' }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
            <p style={{ marginTop: '1rem' }}>Clique no botão <strong>Publicar</strong> e recarregue esta página.</p>
        </div>
    </div>
);

const CountdownTimer: FC<{ deadline: string | null }> = ({ deadline }) => {
    const calculateTimeLeft = () => {
        if (!deadline) return null;
        const difference = +new Date(deadline) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutos: Math.floor((difference / 1000 / 60) % 60),
                segundos: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        return () => clearInterval(timer);
    }, [deadline]);

    if (!timeLeft || Object.keys(timeLeft).length === 0) {
        return <div className="countdown-timer expired">Prazo para montar equipe encerrado!</div>;
    }

    return (
        <div className="countdown-timer">
            <span>Bloqueio em:</span>
            <strong>{timeLeft.dias}d {timeLeft.horas}h {timeLeft.minutos}m {timeLeft.segundos}s</strong>
        </div>
    );
};

const MyTeamDisplay: FC<{
    team: Team | undefined;
    drivers: Driver[];
    constructors: Constructor[];
}> = ({ team, drivers, constructors }) => {
    if (!team || (team.drivers.length === 0 && team.constructors.length === 0)) {
        return (
            <div className="container" style={{textAlign: 'center'}}>
                <h2>Você ainda não montou sua equipe.</h2>
                <p>Vá até a aba "Montar Equipe" para selecionar seus pilotos e construtores.</p>
            </div>
        );
    }

    const myDrivers = drivers.filter(d => team.drivers.includes(d.id));
    const myConstructors = constructors.filter(c => team.constructors.includes(c.id));

    const totalValue = [...myDrivers, ...myConstructors].reduce((acc, curr) => acc + curr.price, 0);

    return (
        <div className="container">
             <div className="container-header">
                <h2>Minha Seleção Atual</h2>
                <div className="budget-info" style={{fontSize: '1.1rem'}}>
                    Valor da Equipe: <span className="cost">${totalValue.toFixed(1)}M</span>
                </div>
             </div>

             <h3 style={{marginTop: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem'}}>Pilotos</h3>
             <div className="my-team-grid">
                 {myDrivers.map(driver => (
                     <div key={driver.id} className="my-team-card">
                         <div className="card-top-strip driver"></div>
                         <div className="card-content">
                             <div className="card-name">{driver.name}</div>
                             <div className="card-price">${driver.price.toFixed(1)}M</div>
                         </div>
                     </div>
                 ))}
                 {Array.from({ length: 5 - myDrivers.length }).map((_, i) => (
                      <div key={`empty-d-${i}`} className="my-team-card empty">
                          <div className="card-content">
                              <span style={{fontSize: '2rem', color: '#ccc'}}>+</span>
                              <div className="card-name" style={{color: '#ccc'}}>Vazio</div>
                          </div>
                      </div>
                 ))}
             </div>

             <h3 style={{marginTop: '2rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem'}}>Construtores</h3>
             <div className="my-team-grid">
                 {myConstructors.map(constructor => (
                     <div key={constructor.id} className="my-team-card">
                         <div className="card-top-strip constructor"></div>
                         <div className="card-content">
                             <div className="card-name">{constructor.name}</div>
                             <div className="card-price">${constructor.price.toFixed(1)}M</div>
                         </div>
                     </div>
                 ))}
                 {Array.from({ length: 2 - myConstructors.length }).map((_, i) => (
                      <div key={`empty-c-${i}`} className="my-team-card empty">
                           <div className="card-content">
                              <span style={{fontSize: '2rem', color: '#ccc'}}>+</span>
                              <div className="card-name" style={{color: '#ccc'}}>Vazio</div>
                          </div>
                      </div>
                 ))}
             </div>
        </div>
    );
};


const TeamSelection: FC<{
    drivers: Driver[];
    constructors: Constructor[];
    teamName: string;
    currentUserTeam: User | undefined;
    onSaveTeam: (teamName: string, team: Team) => void;
    deadline: string | null;
}> = ({ drivers, constructors, teamName, currentUserTeam, onSaveTeam, deadline }) => {
    const [selectedDrivers, setSelectedDrivers] = useState<number[]>(currentUserTeam?.team.drivers || []);
    const [selectedConstructors, setSelectedConstructors] = useState<number[]>(currentUserTeam?.team.constructors || []);
    const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

    useEffect(() => {
        setSelectedDrivers(currentUserTeam?.team.drivers || []);
        setSelectedConstructors(currentUserTeam?.team.constructors || []);
    }, [currentUserTeam]);


    const isLocked = deadline ? new Date() > new Date(deadline) : false;

    const teamCost = useMemo(() => {
        const driverCost = selectedDrivers.reduce((sum, id) => sum + (drivers.find(d => d.id === id)?.price || 0), 0);
        const constructorCost = selectedConstructors.reduce((sum, id) => sum + (constructors.find(c => c.id === id)?.price || 0), 0);
        return driverCost + constructorCost;
    }, [selectedDrivers, selectedConstructors, drivers, constructors]);

    const sortedDrivers = useMemo(() => {
        const items = [...drivers];
        if (sortOrder === 'asc') {
            return items.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            return items.sort((a, b) => b.price - a.price);
        }
        return items.sort((a, b) => a.id - b.id);
    }, [drivers, sortOrder]);

    const sortedConstructors = useMemo(() => {
        const items = [...constructors];
        if (sortOrder === 'asc') {
            return items.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            return items.sort((a, b) => b.price - a.price);
        }
        return items.sort((a, b) => a.id - b.id);
    }, [constructors, sortOrder]);

    const remainingBudget = BUDGET - teamCost;

    const handleSelectDriver = (id: number) => {
        if (selectedDrivers.includes(id)) {
            setSelectedDrivers(selectedDrivers.filter(dId => dId !== id));
        } else if (selectedDrivers.length < 5) {
            const driverPrice = drivers.find(d => d.id === id)?.price || 0;
            if (teamCost + driverPrice <= BUDGET) {
                setSelectedDrivers([...selectedDrivers, id]);
            } else {
                alert("Orçamento excedido!");
            }
        }
    };

    const handleSelectConstructor = (id: number) => {
        if (selectedConstructors.includes(id)) {
            setSelectedConstructors(selectedConstructors.filter(cId => cId !== id));
        } else if (selectedConstructors.length < 2) {
            const constructorPrice = constructors.find(c => c.id === id)?.price || 0;
            if (teamCost + constructorPrice <= BUDGET) {
                setSelectedConstructors([...selectedConstructors, id]);
            } else {
                alert("Orçamento excedido!");
            }
        }
    };
    
    const handleSave = () => {
        if (selectedDrivers.length !== 5 || selectedConstructors.length !== 2) {
            alert('Você precisa selecionar 5 pilotos e 2 construtores.');
            return;
        }
        onSaveTeam(teamName, { drivers: selectedDrivers, constructors: selectedConstructors });
    };

    return (
        <div className="container">
            {isLocked && (
                <div className="lock-notification">
                    O prazo para montar a equipe encerrou. As equipes estão bloqueadas para esta etapa.
                </div>
            )}
            <div className="container-header" style={{flexWrap: 'wrap', gap: '1rem'}}>
                 <h2>Monte sua Equipe - <span style={{color: 'var(--primary-color)'}}>{teamName}</span></h2>
                 <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <label htmlFor="sortOrder" style={{fontWeight: 600, color: 'var(--text-secondary-color)'}}>Preço:</label>
                    <select 
                        id="sortOrder"
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        style={{padding: '0.5rem', width: 'auto'}}
                    >
                        <option value="default">Padrão</option>
                        <option value="desc">Maior Preço</option>
                        <option value="asc">Menor Preço</option>
                    </select>
                 </div>
            </div>

            <div className="grid">
                <div>
                    <h3>Pilotos ({selectedDrivers.length}/5)</h3>
                    <div className="item-list">
                        {sortedDrivers.map(driver => (
                            <div key={driver.id} className={`item ${selectedDrivers.includes(driver.id) ? 'selected' : ''}`}>
                                <span className="item-name">{driver.name}</span>
                                <span>${driver.price.toFixed(1)}M</span>
                                <div className="item-action">
                                    <button onClick={() => handleSelectDriver(driver.id)} disabled={isLocked}>
                                        {selectedDrivers.includes(driver.id) ? 'Remover' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3>Construtores ({selectedConstructors.length}/2)</h3>
                     <div className="item-list">
                        {sortedConstructors.map(c => (
                            <div key={c.id} className={`item ${selectedConstructors.includes(c.id) ? 'selected' : ''}`}>
                                <span className="item-name">{c.name}</span>
                                <span>${c.price.toFixed(1)}M</span>
                                <div className="item-action">
                                    <button onClick={() => handleSelectConstructor(c.id)} disabled={isLocked}>
                                        {selectedConstructors.includes(c.id) ? 'Remover' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3>Sua Equipe</h3>
                    <div className="card">
                        <h4>Pilotos:</h4>
                        {selectedDrivers.map(id => <p key={id}>- {drivers.find(d => d.id === id)?.name}</p>)}
                        <h4 style={{marginTop: '1rem'}}>Construtores:</h4>
                        {selectedConstructors.map(id => <p key={id}>- {constructors.find(c => c.id === id)?.name}</p>)}
                    </div>
                    <div className="budget-info">
                        Custo Total: <span className="cost">${teamCost.toFixed(1)}M</span>
                    </div>
                    <div className="budget-info">
                        Orçamento Restante: ${remainingBudget.toFixed(1)}M
                    </div>
                    <button onClick={handleSave} style={{width: '100%', marginTop: '1rem'}} disabled={isLocked}>Salvar Equipe</button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel: FC<{
    drivers: Driver[];
    constructors: Constructor[];
    users: User[];
    onUpdatePrices: (drivers: Driver[], constructors: Constructor[]) => void;
    onFinalizeRound: (drivers: Driver[], constructors: Constructor[], gpName: string, allUsers: User[]) => void;
    deadline: string | null;
    onSetDeadline: (deadline: string) => void;
}> = ({ drivers, constructors, onUpdatePrices, onFinalizeRound, deadline, onSetDeadline, users }) => {
    // Local state uses flexible types for prices to handle text inputs correctly during editing
    // This prevents decimal points from disappearing while typing
    const [localDrivers, setLocalDrivers] = useState<(Omit<Driver, 'price'> & { price: number | string })[]>([...drivers]);
    const [localConstructors, setLocalConstructors] = useState<(Omit<Constructor, 'price'> & { price: number | string })[]>([...constructors]);
    const [gpName, setGpName] = useState('');
    const [newDeadline, setNewDeadline] = useState(deadline ? deadline.slice(0, 16) : '');

    useEffect(() => {
        setLocalDrivers(drivers.map(d => ({ ...d })));
        setLocalConstructors(constructors.map(c => ({ ...c })));
    }, [drivers, constructors]);

    const handlePriceChange = (id: number, type: 'driver' | 'constructor', value: string) => {
        // Store value as string temporarily to allow typing decimals like "29."
        if (type === 'driver') {
            setLocalDrivers(prev => prev.map(d => d.id === id ? { ...d, price: value } : d));
        } else {
            setLocalConstructors(prev => prev.map(c => c.id === id ? { ...c, price: value } : c));
        }
    };
    
    const handlePointsChange = (id: number, type: 'driver' | 'constructor', value: string) => {
        const points = parseInt(value, 10) || 0;
        if (type === 'driver') {
            setLocalDrivers(prev => prev.map(d => d.id === id ? { ...d, points } : d));
        } else {
            setLocalConstructors(prev => prev.map(c => c.id === id ? { ...c, points } : c));
        }
    };

    const handleSavePrices = () => {
        // Convert strings back to floats when saving
        const cleanDrivers = localDrivers.map(d => ({
            ...d, 
            price: parseFloat(d.price.toString()) || 0 
        }));
        const cleanConstructors = localConstructors.map(c => ({
            ...c, 
            price: parseFloat(c.price.toString()) || 0 
        }));
        onUpdatePrices(cleanDrivers, cleanConstructors);
    };

    // For finalize, we need to ensure we pass clean numbers as well, although usually 
    // finalize only deals with points. But to be safe on type integrity:
    const handleFinalize = () => {
         const cleanDrivers = localDrivers.map(d => ({
            ...d, 
            price: parseFloat(d.price.toString()) || 0 
        }));
        const cleanConstructors = localConstructors.map(c => ({
            ...c, 
            price: parseFloat(c.price.toString()) || 0 
        }));
        onFinalizeRound(cleanDrivers, cleanConstructors, gpName, users);
    }
    
    return (
        <div className="container">
            <h2>Painel do Administrador</h2>
            <div className="grid">
                <div>
                    <h3>Definir Preços</h3>
                    <h4>Pilotos</h4>
                    {localDrivers.sort((a,b) => a.id - b.id).map(d => (
                        <div key={d.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <span style={{flex: 1}}>{d.name}</span>
                            <input 
                                type="number" 
                                value={d.price} 
                                onChange={e => handlePriceChange(d.id, 'driver', e.target.value)} 
                                style={{width: '100px'}} 
                                step="0.1"
                            />
                        </div>
                    ))}
                    <h4 style={{marginTop: '1rem'}}>Construtores</h4>
                    {localConstructors.sort((a,b) => a.id - b.id).map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <span style={{flex: 1}}>{c.name}</span>
                            <input 
                                type="number" 
                                value={c.price} 
                                onChange={e => handlePriceChange(c.id, 'constructor', e.target.value)} 
                                style={{width: '100px'}} 
                                step="0.1" 
                            />
                        </div>
                    ))}
                    <button onClick={handleSavePrices} style={{marginTop: '1rem'}}>Salvar Preços</button>
                </div>
                 <div>
                    <h3>Lançar Pontos da Etapa</h3>
                    <h4>Pilotos</h4>
                    {localDrivers.sort((a,b) => a.id - b.id).map(d => (
                        <div key={d.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <span style={{flex: 1}}>{d.name}</span>
                            <input type="number" value={d.points} onChange={e => handlePointsChange(d.id, 'driver', e.target.value)} style={{width: '100px'}} />
                        </div>
                    ))}
                    <h4 style={{marginTop: '1rem'}}>Construtores</h4>
                    {localConstructors.sort((a,b) => a.id - b.id).map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <span style={{flex: 1}}>{c.name}</span>
                            <input type="number" value={c.points} onChange={e => handlePointsChange(c.id, 'constructor', e.target.value)} style={{width: '100px'}} />
                        </div>
                    ))}
                    <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                         <label htmlFor="gpName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome do GP</label>
                         <input
                            id="gpName"
                            type="text"
                            value={gpName}
                            onChange={(e) => setGpName(e.target.value)}
                            placeholder="Ex: GP de Interlagos"
                         />
                    </div>
                    <button onClick={handleFinalize} style={{width: '100%'}}>Calcular e Finalizar Etapa</button>
                </div>
                 <div>
                    <h3>Prazo Final Para Bloqueio de Equipe</h3>
                    <p style={{marginBottom: '1rem', color: 'var(--text-secondary-color)'}}>Defina a data e hora limite para os usuários modificarem suas equipes.</p>
                    <input 
                        type="datetime-local" 
                        value={newDeadline} 
                        onChange={e => setNewDeadline(e.target.value)}
                    />
                    <button 
                        onClick={() => onSetDeadline(new Date(newDeadline).toISOString())} 
                        style={{marginTop: '1rem', width: '100%'}}
                        disabled={!newDeadline}
                    >
                        Salvar Prazo
                    </button>
                </div>
            </div>
        </div>
    );
}

const RaceResults: FC<{ raceHistory: RaceWeekend[] }> = ({ raceHistory }) => {
    const [selectedWeekendId, setSelectedWeekendId] = useState<number | null>(null);

    useEffect(() => {
        if (raceHistory.length > 0) {
            setSelectedWeekendId(raceHistory[raceHistory.length - 1].id);
        }
    }, [raceHistory]);

    const results = useMemo(() => {
        if (!selectedWeekendId) return [];
        return raceHistory.find(w => w.id === selectedWeekendId)?.results || [];
    }, [selectedWeekendId, raceHistory]);


    if (raceHistory.length === 0) {
        return <div className="container"><p>Ainda não há resultados para nenhuma etapa.</p></div>
    }

    const podium = results.slice(0, 3);
    const gold = podium.find((_, i) => i === 0);
    const silver = podium.find((_, i) => i === 1);
    const bronze = podium.find((_, i) => i === 2);

    return (
        <div className="container">
            <div className="container-header">
                <h2>Resultados da Etapa</h2>
                {raceHistory.length > 0 && (
                     <select
                        value={selectedWeekendId ?? ''}
                        onChange={(e) => setSelectedWeekendId(Number(e.target.value))}
                     >
                        {[...raceHistory].reverse().map(weekend => (
                            <option key={weekend.id} value={weekend.id}>
                                {weekend.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
           
            <div className="podium">
                {silver && <div className="podium-step silver"><div className="podium-position">2</div><div className="podium-name">{silver.userName}</div><div className="podium-points">{silver.weekendPoints} pts</div></div>}
                {gold && <div className="podium-step gold"><div className="podium-position">1</div><div className="podium-name">{gold.userName}</div><div className="podium-points">{gold.weekendPoints} pts</div></div>}
                {bronze && <div className="podium-step bronze"><div className="podium-position">3</div><div className="podium-name">{bronze.userName}</div><div className="podium-points">{bronze.weekendPoints} pts</div></div>}
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Nome da Equipe</th>
                            <th>Pontos da Etapa</th>
                            <th>Pontos no Campeonato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r, index) => (
                            <tr key={r.userName}>
                                <td>{index + 1}</td>
                                <td>{r.userName}</td>
                                <td>{r.weekendPoints}</td>
                                <td>{r.championshipPointsAwarded}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const Standings: FC<{ users: User[] }> = ({ users }) => {
    const sortedUsers = [...users].sort((a, b) => b.championshipPoints - a.championshipPoints);
    return (
        <div className="container">
            <h2>Classificação Geral</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Nome da Equipe</th>
                            <th>Pontos no Campeonato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((u, index) => (
                            <tr key={u.name}>
                                <td>{index + 1}</td>
                                <td>{u.name}</td>
                                <td>{u.championshipPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const Auth: FC<{
    onLogin: (username: string, password: string) => Promise<void>;
    onRegister: (user: Account) => Promise<void>;
}> = ({ onLogin, onRegister }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoginView) {
            await onLogin(username, password);
        } else {
            const newAccount: Account = { username, password, teamName: null };
            await onRegister(newAccount);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>{isLoginView ? 'Login' : 'Registrar'}</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nome de usuário"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                />
                <button type="submit">{isLoginView ? 'Entrar' : 'Registrar'}</button>
                <p onClick={() => setIsLoginView(!isLoginView)} className="auth-toggle">
                    {isLoginView ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login'}
                </p>
            </form>
        </div>
    );
};

const TeamNameSetup: FC<{ onSave: (teamName: string) => void; users: User[] }> = ({ onSave, users }) => {
    const [teamName, setTeamName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim()) {
            alert('Por favor, insira um nome para a equipe.');
            return;
        }
        if (users.some(u => u.name.toLowerCase() === teamName.trim().toLowerCase())) {
            alert('Este nome de equipe já está em uso. Escolha outro.');
            return;
        }
        onSave(teamName.trim());
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Crie sua Equipe</h2>
                <p>Escolha um nome para a sua equipe de Fantasy. Este nome será usado por toda a temporada.</p>
                <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nome da sua equipe"
                    required
                />
                <button type="submit">Salvar Nome da Equipe</button>
            </form>
        </div>
    );
};


// --- Main App Component ---
const App: FC = () => {
    const [view, setView] = useState<'team' | 'my-team' | 'results' | 'standings'>('team');
    const [firebaseError, setFirebaseError] = useState<boolean>(false);
    
    // State is now fetched from Firestore, not local storage
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [constructors, setConstructors] = useState<Constructor[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [raceHistory, setRaceHistory] = useState<RaceWeekend[]>([]);
    const [deadline, setDeadline] = useState<string | null>(null);

    // Current user is persisted in session storage to survive refreshes
    const [currentUser, setCurrentUser] = useSessionStorageState<Account | null>(null, 'f1-currentUser');

    // --- Firebase Data Listeners ---
    useEffect(() => {
        const handleError = (error: any) => {
             console.error("Firebase Error:", error);
             if (error.code === 'permission-denied') {
                 setFirebaseError(true);
             }
        };

        // Seed database on first load if it's empty
        const seedDatabase = async () => {
            try {
                const driversQuery = query(collection(db, 'drivers'));
                const driversSnapshot = await getDocs(driversQuery);
                if (driversSnapshot.empty) {
                    console.log("Database is empty. Seeding initial data...");
                    const batch = writeBatch(db);

                    initialDrivers.forEach(driver => {
                        const docRef = doc(db, 'drivers', driver.id.toString());
                        batch.set(docRef, driver);
                    });

                    initialConstructors.forEach(constructor => {
                        const docRef = doc(db, 'constructors', constructor.id.toString());
                        batch.set(docRef, constructor);
                    });

                    const configRef = doc(db, 'config', 'main');
                    batch.set(configRef, { deadline: null });
                    
                    await batch.commit();
                     console.log("Database seeded successfully.");
                }
            } catch (error) {
                handleError(error);
            }
        };
        seedDatabase();

        // Set up real-time listeners with error handling
        const unsubDrivers = onSnapshot(
            query(collection(db, 'drivers'), orderBy('id')), 
            (snapshot) => {
                setDrivers(snapshot.docs.map(doc => doc.data() as Driver));
            },
            handleError
        );
        const unsubConstructors = onSnapshot(
            query(collection(db, 'constructors'), orderBy('id')), 
            (snapshot) => {
                setConstructors(snapshot.docs.map(doc => doc.data() as Constructor));
            },
            handleError
        );
        const unsubUsers = onSnapshot(
            collection(db, 'users'), 
            (snapshot) => {
                setUsers(snapshot.docs.map(doc => doc.data() as User));
            },
            handleError
        );
        const unsubRaceHistory = onSnapshot(
            query(collection(db, 'raceHistory'), orderBy('id')), 
            (snapshot) => {
                setRaceHistory(snapshot.docs.map(doc => doc.data() as RaceWeekend));
            },
            handleError
        );
        const unsubConfig = onSnapshot(
            doc(db, 'config', 'main'), 
            (doc) => {
                setDeadline(doc.data()?.deadline || null);
            },
            handleError
        );

        // Cleanup listeners on unmount
        return () => {
            unsubDrivers();
            unsubConstructors();
            unsubUsers();
            unsubRaceHistory();
            unsubConfig();
        };
    }, []);

    // --- Firestore Handlers ---
    const handleSaveTeam = async (teamName: string, team: Team) => {
        try {
            const userRef = doc(db, 'users', teamName);
            await updateDoc(userRef, { team });
            alert(`Equipe ${teamName} atualizada!`);
        } catch (error) {
            console.error("Error saving team: ", error);
            alert("Ocorreu um erro ao salvar sua equipe. Verifique sua conexão ou permissões.");
        }
    };
    
    const handleUpdatePrices = async (updatedDrivers: Driver[], updatedConstructors: Constructor[]) => {
        try {
            const batch = writeBatch(db);
            updatedDrivers.forEach(d => {
                const docRef = doc(db, 'drivers', d.id.toString());
                batch.update(docRef, { price: d.price, points: 0 }); // Reset points on price update
            });
            updatedConstructors.forEach(c => {
                const docRef = doc(db, 'constructors', c.id.toString());
                batch.update(docRef, { price: c.price, points: 0 });
            });
            await batch.commit();
            alert('Preços atualizados com sucesso!');
        } catch (error) {
             console.error("Error updating prices: ", error);
             alert("Erro ao atualizar preços.");
        }
    };

    const handleFinalizeRound = async (finalDrivers: Driver[], finalConstructors: Constructor[], gpName: string, allUsers: User[]) => {
        if (!gpName.trim()) {
            alert('Por favor, insira o nome do GP antes de finalizar a etapa.');
            return;
        }

        try {
            const batch = writeBatch(db);

            // 1. Update master driver/constructor data with points
            finalDrivers.forEach(d => {
                const docRef = doc(db, 'drivers', d.id.toString());
                batch.update(docRef, { points: d.points });
            });
            finalConstructors.forEach(c => {
                const docRef = doc(db, 'constructors', c.id.toString());
                batch.update(docRef, { points: c.points });
            });
            
            // 2. Calculate weekend points for each user
            const usersWithScores = allUsers.map(user => {
                if (!user.team.drivers || !user.team.constructors) {
                     return { ...user, weekendPoints: 0 };
                }
                const driverPoints = user.team.drivers.reduce((sum, id) => sum + (finalDrivers.find(d => d.id === id)?.points || 0), 0);
                const constructorPoints = user.team.constructors.reduce((sum, id) => sum + (finalConstructors.find(c => c.id === id)?.points || 0), 0);
                return { ...user, weekendPoints: driverPoints + constructorPoints };
            });

            // 3. Sort users by weekend points
            const sortedUsers = [...usersWithScores].sort((a, b) => b.weekendPoints - a.weekendPoints);

            // 4. Generate race results and prepare user updates
            const newRaceResults: RaceResult[] = [];
            sortedUsers.forEach((sortedUser, index) => {
                const championshipPointsAwarded = CHAMPIONSHIP_POINTS_MAP[index] || 0;
                newRaceResults.push({
                    userName: sortedUser.name,
                    weekendPoints: sortedUser.weekendPoints,
                    championshipPointsAwarded,
                });
                
                const userRef = doc(db, 'users', sortedUser.name);
                const originalUser = allUsers.find(u => u.name === sortedUser.name);
                if(originalUser) {
                    batch.update(userRef, {
                        championshipPoints: originalUser.championshipPoints + championshipPointsAwarded,
                        team: { drivers: [], constructors: [] }, // Reset team
                        weekendPoints: 0 // Reset weekend points
                    });
                }
            });

            // 5. Create a new race weekend and add it to history
            const newWeekend: RaceWeekend = {
                id: Date.now(),
                name: gpName,
                results: newRaceResults,
            };
            const raceHistoryRef = doc(db, 'raceHistory', newWeekend.id.toString());
            batch.set(raceHistoryRef, newWeekend);
            
            await batch.commit();
            alert('Etapa finalizada! Resultados calculados e equipes resetadas para a próxima etapa.');
        } catch (error) {
            console.error("Error finalizing round: ", error);
            alert("Erro ao finalizar etapa.");
        }
    };
    
    const handleLogin = async (username: string, password: string) => {
        try {
            const docRef = doc(db, "accounts", username);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().password === password) {
                setCurrentUser(docSnap.data() as Account);
            } else {
                alert('Usuário ou senha inválidos.');
            }
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.code === 'permission-denied') {
                setFirebaseError(true);
            } else {
                alert("Erro ao tentar fazer login. Verifique sua conexão.");
            }
        }
    };

    const handleRegister = async (newUser: Account) => {
         try {
             const docRef = doc(db, "accounts", newUser.username);
             const docSnap = await getDoc(docRef);
             if(docSnap.exists()) {
                 alert('Este nome de usuário já existe.');
                 return;
             }
             await setDoc(docRef, newUser);
             setCurrentUser(newUser);
         } catch (error: any) {
            console.error("Register error:", error);
             if (error.code === 'permission-denied') {
                setFirebaseError(true);
            } else {
                alert("Erro ao tentar registrar.");
            }
         }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView('team');
    };
    
    const handleSetTeamName = async (teamName: string) => {
        if (!currentUser) return;
        try {
            const batch = writeBatch(db);
            
            // Update account
            const accountRef = doc(db, 'accounts', currentUser.username);
            batch.update(accountRef, { teamName });
            
            // Create the user/fantasy team entry
            const newUser: User = { 
                name: teamName, 
                team: { drivers: [], constructors: [] }, 
                weekendPoints: 0, 
                championshipPoints: 0 
            };
            const userRef = doc(db, 'users', teamName);
            batch.set(userRef, newUser);

            await batch.commit();
            setCurrentUser({ ...currentUser, teamName });
        } catch (error) {
            console.error("Set team name error:", error);
            alert("Erro ao salvar nome da equipe.");
        }
    };

    const handleSetDeadline = async (newDeadline: string) => {
        try {
            const configRef = doc(db, 'config', 'main');
            await setDoc(configRef, { deadline: newDeadline }, { merge: true });
            alert('Novo prazo para bloqueio de equipes salvo!');
        } catch (error) {
            console.error("Set deadline error:", error);
            alert("Erro ao salvar prazo.");
        }
    };

    if (firebaseError) {
        return <PermissionErrorScreen />;
    }

    // 1. Not Logged In View
    if (!currentUser) {
        return (
             <>
                <h1>F1 FANTASY LEAGUE</h1>
                <Auth onLogin={handleLogin} onRegister={handleRegister} />
             </>
        )
    }

    // 2. Admin View
    if (currentUser.username === 'admin') {
        return (
            <>
                <header className="admin-header">
                    <h1>F1 FANTASY LEAGUE</h1>
                    <div className="user-info">
                        <span>Usuário: <strong>Admin</strong></span>
                        <button onClick={handleLogout} className="logout-button">Sair</button>
                    </div>
                </header>
                <AdminPanel 
                    drivers={drivers} 
                    constructors={constructors} 
                    users={users} 
                    onUpdatePrices={handleUpdatePrices} 
                    onFinalizeRound={handleFinalizeRound} 
                    deadline={deadline}
                    onSetDeadline={handleSetDeadline}
                />
            </>
        )
    }

    // 3. Regular User - Team Name Setup
    if (!currentUser.teamName) {
        return (
             <>
                <h1>F1 FANTASY LEAGUE</h1>
                <TeamNameSetup onSave={handleSetTeamName} users={users}/>
            </>
        )
    }
    
    // 4. Regular User - Main App
    const currentUserTeam = users.find(u => u.name === currentUser?.teamName);

    return (
        <>
            <header>
                <h1>F1 FANTASY LEAGUE</h1>
                <div className="header-info-bar">
                    {deadline && <CountdownTimer deadline={deadline} />}
                    <div className="user-info">
                        <span>Equipe: <strong>{currentUser.teamName}</strong></span>
                        <button onClick={handleLogout} className="logout-button">Sair</button>
                    </div>
                </div>
            </header>
            <nav className="tabs">
                <button className={`tab-button ${view === 'team' ? 'active' : ''}`} onClick={() => setView('team')}>Montar Equipe</button>
                <button className={`tab-button ${view === 'my-team' ? 'active' : ''}`} onClick={() => setView('my-team')}>Minha Equipe</button>
                <button className={`tab-button ${view === 'results' ? 'active' : ''}`} onClick={() => setView('results')}>Resultados da Etapa</button>
                <button className={`tab-button ${view === 'standings' ? 'active' : ''}`} onClick={() => setView('standings')}>Classificação Geral</button>
            </nav>

            {view === 'team' && <TeamSelection drivers={drivers} constructors={constructors} teamName={currentUser.teamName} currentUserTeam={currentUserTeam} onSaveTeam={handleSaveTeam} deadline={deadline} />}
            {view === 'my-team' && <MyTeamDisplay team={currentUserTeam?.team} drivers={drivers} constructors={constructors} />}
            {view === 'results' && <RaceResults raceHistory={raceHistory} />}
            {view === 'standings' && <Standings users={users} />}
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
