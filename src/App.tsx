import { useState, useEffect, useRef, useCallback } from 'react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  task: string;
  cpu: number;
  memory: number;
  uptime: number;
  lastPing: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  agent: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
}

const AGENT_NAMES = ['NEXUS-7', 'PHANTOM-X', 'CIPHER-9', 'VORTEX-3', 'ECHO-5', 'PULSE-2'];
const TASKS = [
  'Analyzing data streams...',
  'Executing build pipeline...',
  'Scanning network nodes...',
  'Processing neural weights...',
  'Compiling source modules...',
  'Indexing knowledge base...',
  'Running diagnostics...',
  'Optimizing parameters...',
];

const SYSTEM_MESSAGES = [
  'Neural network synchronization complete',
  'Quantum encryption layer active',
  'Memory defragmentation successful',
  'Agent mesh topology optimized',
  'Distributed cache refreshed',
  'Anomaly detection threshold calibrated',
];

function generateAgent(index: number): Agent {
  const statuses: Agent['status'][] = ['active', 'active', 'active', 'idle', 'error', 'offline'];
  return {
    id: `agent-${index}`,
    name: AGENT_NAMES[index % AGENT_NAMES.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    task: TASKS[Math.floor(Math.random() * TASKS.length)],
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    uptime: Math.floor(Math.random() * 86400),
    lastPing: Date.now() - Math.floor(Math.random() * 10000),
  };
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function TypewriterText({ text, delay = 20 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 500);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);
  
  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse">▌</span>}
    </span>
  );
}

function StatusOrb({ status }: { status: Agent['status'] }) {
  const colors = {
    active: 'bg-[#00ff9d] shadow-[0_0_10px_#00ff9d,0_0_20px_#00ff9d,0_0_30px_#00ff9d]',
    idle: 'bg-[#00d4ff] shadow-[0_0_10px_#00d4ff,0_0_20px_#00d4ff]',
    error: 'bg-[#ff006e] shadow-[0_0_10px_#ff006e,0_0_20px_#ff006e,0_0_30px_#ff006e] animate-pulse',
    offline: 'bg-gray-600',
  };
  
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} transition-all duration-300`} />
  );
}

function AgentCard({ agent, isSelected, onClick }: { agent: Agent; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded border cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'border-[#00ff9d] bg-[#00ff9d]/10 shadow-[0_0_20px_rgba(0,255,157,0.3),inset_0_0_20px_rgba(0,255,157,0.1)]' 
          : 'border-[#1a1a2e] bg-[#0d0d14] hover:border-[#00d4ff]/50 hover:bg-[#0d0d14]/80'
        }
      `}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff9d]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusOrb status={agent.status} />
          <span className="font-['Orbitron'] font-bold text-[#00ff9d] tracking-wider text-sm">
            {agent.name}
          </span>
        </div>
        <span className={`text-xs uppercase tracking-widest ${
          agent.status === 'active' ? 'text-[#00ff9d]' : 
          agent.status === 'idle' ? 'text-[#00d4ff]' : 
          agent.status === 'error' ? 'text-[#ff006e]' : 'text-gray-500'
        }`}>
          {agent.status}
        </span>
      </div>
      
      <div className="text-xs text-gray-400 mb-3 truncate">{agent.task}</div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">CPU</span>
          <div className="h-1 bg-[#1a1a2e] rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${agent.cpu > 80 ? 'bg-[#ff006e]' : 'bg-[#00ff9d]'}`}
              style={{ width: `${agent.cpu}%` }}
            />
          </div>
        </div>
        <div>
          <span className="text-gray-500">MEM</span>
          <div className="h-1 bg-[#1a1a2e] rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${agent.memory > 80 ? 'bg-[#ff006e]' : 'bg-[#00d4ff]'}`}
              style={{ width: `${agent.memory}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalOutput({ logs }: { logs: LogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);
  
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-[#00ff9d]';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-[#ff006e]';
      case 'system': return 'text-[#00d4ff]';
      default: return 'text-gray-300';
    }
  };
  
  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '[✓]';
      case 'warning': return '[!]';
      case 'error': return '[✗]';
      case 'system': return '[◈]';
      default: return '[→]';
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto font-mono text-sm p-4 space-y-1 scrollbar-thin"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(13,13,20,0.98) 100%)',
      }}
    >
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
          <span className="text-gray-600 shrink-0">
            {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}.{log.timestamp.getMilliseconds().toString().padStart(3, '0')}
          </span>
          <span className={`shrink-0 ${getLogColor(log.type)}`}>{getLogPrefix(log.type)}</span>
          <span className="text-[#00d4ff] shrink-0">[{log.agent}]</span>
          <span className={getLogColor(log.type)}>{log.message}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-[#00ff9d] animate-pulse">
        <span className="text-gray-600">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}.000
        </span>
        <span>▌</span>
      </div>
    </div>
  );
}

function CommandInput({ onSubmit }: { onSubmit: (cmd: string) => void }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onSubmit(command);
      setHistory(prev => [...prev, command]);
      setCommand('');
      setHistoryIndex(-1);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setCommand(history[history.length - 1 - newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      setCommand(newIndex === -1 ? '' : history[history.length - 1 - newIndex] || '');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00ff9d]/20 via-[#00d4ff]/20 to-[#00ff9d]/20 blur-sm animate-pulse" />
      <div className="relative flex items-center bg-[#0a0a0f] border border-[#00ff9d]/30 rounded-lg overflow-hidden">
        <span className="text-[#00ff9d] pl-4 pr-2 font-bold">❯</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command... (try: status, deploy, restart, scan)"
          className="flex-1 bg-transparent text-white py-3 px-2 outline-none placeholder-gray-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[#00ff9d]/10 text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-colors border-l border-[#00ff9d]/30 font-['Orbitron'] text-sm tracking-wider"
        >
          EXEC
        </button>
      </div>
    </form>
  );
}

function MetricsPanel({ agents }: { agents: Agent[] }) {
  const activeCount = agents.filter(a => a.status === 'active').length;
  const errorCount = agents.filter(a => a.status === 'error').length;
  const avgCpu = Math.round(agents.reduce((acc, a) => acc + a.cpu, 0) / agents.length);
  const avgMem = Math.round(agents.reduce((acc, a) => acc + a.memory, 0) / agents.length);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'ACTIVE AGENTS', value: `${activeCount}/${agents.length}`, color: '#00ff9d' },
        { label: 'ERRORS', value: errorCount.toString(), color: errorCount > 0 ? '#ff006e' : '#00ff9d' },
        { label: 'AVG CPU', value: `${avgCpu}%`, color: avgCpu > 80 ? '#ff006e' : '#00d4ff' },
        { label: 'AVG MEMORY', value: `${avgMem}%`, color: avgMem > 80 ? '#ff006e' : '#00d4ff' },
      ].map((metric) => (
        <div 
          key={metric.label}
          className="relative p-4 rounded border border-[#1a1a2e] bg-[#0d0d14]/80 overflow-hidden group hover:border-[#00d4ff]/30 transition-colors"
        >
          <div 
            className="absolute bottom-0 left-0 h-1 transition-all duration-500"
            style={{ 
              backgroundColor: metric.color,
              width: metric.label.includes('CPU') || metric.label.includes('MEMORY') 
                ? metric.value 
                : metric.label === 'ACTIVE AGENTS' 
                  ? `${(activeCount / agents.length) * 100}%`
                  : '100%',
              boxShadow: `0 0 10px ${metric.color}`
            }}
          />
          <div className="text-xs text-gray-500 tracking-widest mb-1">{metric.label}</div>
          <div 
            className="font-['Orbitron'] text-2xl font-bold"
            style={{ color: metric.color, textShadow: `0 0 20px ${metric.color}` }}
          >
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(() => 
    Array.from({ length: 6 }, (_, i) => generateAgent(i))
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [bootComplete, setBootComplete] = useState(false);
  
  const addLog = useCallback((agent: string, type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev.slice(-100), {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      agent,
      type,
      message
    }]);
  }, []);
  
  // Boot sequence
  useEffect(() => {
    const bootMessages = [
      { delay: 300, msg: 'Initializing CLAWBOT Terminal v2.0.7...' },
      { delay: 800, msg: 'Loading neural interface drivers...' },
      { delay: 1200, msg: 'Establishing quantum-encrypted connections...' },
      { delay: 1600, msg: 'Synchronizing agent mesh network...' },
      { delay: 2000, msg: 'Boot sequence complete. All systems nominal.' },
    ];
    
    bootMessages.forEach(({ delay, msg }) => {
      setTimeout(() => addLog('SYSTEM', 'system', msg), delay);
    });
    
    setTimeout(() => setBootComplete(true), 2500);
  }, [addLog]);
  
  // Simulate agent activity
  useEffect(() => {
    if (!bootComplete) return;
    
    const interval = setInterval(() => {
      // Random log generation
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const logTypes: LogEntry['type'][] = ['info', 'info', 'info', 'success', 'warning'];
      const messages = [
        'Processing batch request #' + Math.floor(Math.random() * 9999),
        'Memory allocation optimized',
        'Task completed successfully',
        'Network latency: ' + Math.floor(Math.random() * 50) + 'ms',
        'Cache hit ratio: ' + (85 + Math.floor(Math.random() * 15)) + '%',
        'Checkpoint saved',
        'Model weights synchronized',
        'Request queue depth: ' + Math.floor(Math.random() * 100),
      ];
      
      if (Math.random() > 0.3) {
        addLog(
          randomAgent.name,
          logTypes[Math.floor(Math.random() * logTypes.length)],
          messages[Math.floor(Math.random() * messages.length)]
        );
      }
      
      // Update agent metrics
      setAgents(prev => prev.map(agent => ({
        ...agent,
        cpu: Math.max(0, Math.min(100, agent.cpu + (Math.random() - 0.5) * 20)),
        memory: Math.max(0, Math.min(100, agent.memory + (Math.random() - 0.5) * 10)),
        uptime: agent.uptime + 1,
        lastPing: agent.status !== 'offline' ? Date.now() : agent.lastPing,
      })));
    }, 1500);
    
    return () => clearInterval(interval);
  }, [bootComplete, agents, addLog]);
  
  const handleCommand = (cmd: string) => {
    const cmdLower = cmd.toLowerCase().trim();
    
    addLog('USER', 'info', `$ ${cmd}`);
    
    if (cmdLower === 'status' || cmdLower === 'ls') {
      agents.forEach((agent, i) => {
        setTimeout(() => {
          addLog('SYSTEM', agent.status === 'error' ? 'error' : 'info', 
            `${agent.name}: ${agent.status.toUpperCase()} | CPU: ${Math.round(agent.cpu)}% | MEM: ${Math.round(agent.memory)}%`
          );
        }, i * 100);
      });
    } else if (cmdLower === 'deploy') {
      addLog('SYSTEM', 'system', 'Initiating deployment sequence...');
      setTimeout(() => addLog('SYSTEM', 'success', 'Deployment successful. All agents updated.'), 2000);
    } else if (cmdLower === 'restart') {
      addLog('SYSTEM', 'warning', 'Restarting all agents...');
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' as const })));
      setTimeout(() => {
        setAgents(prev => prev.map(a => ({ ...a, status: 'active' as const })));
        addLog('SYSTEM', 'success', 'All agents restarted successfully.');
      }, 3000);
    } else if (cmdLower === 'scan') {
      addLog('SYSTEM', 'system', 'Scanning network for anomalies...');
      setTimeout(() => addLog('SYSTEM', 'success', 'Scan complete. No threats detected.'), 2500);
    } else if (cmdLower === 'help') {
      ['Available commands:', '  status  - Show all agent statuses', '  deploy  - Deploy updates to all agents', '  restart - Restart all agents', '  scan    - Scan network for anomalies', '  clear   - Clear terminal output'].forEach((line, i) => {
        setTimeout(() => addLog('SYSTEM', 'info', line), i * 50);
      });
    } else if (cmdLower === 'clear') {
      setLogs([]);
    } else {
      addLog('SYSTEM', 'error', `Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
      {/* Background grid effect */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,157,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,157,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff9d]/5 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00d4ff]/5 blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-sm z-10">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="text-4xl animate-bounce">🦀</div>
                <div className="absolute inset-0 text-4xl blur-sm opacity-50 animate-pulse">🦀</div>
              </div>
              <div>
                <h1 className="font-['Orbitron'] text-xl lg:text-2xl font-black tracking-[0.2em] text-[#00ff9d]"
                    style={{ textShadow: '0 0 30px rgba(0,255,157,0.5)' }}>
                  CLAWBOT TERMINAL
                </h1>
                <div className="text-xs text-gray-500 tracking-[0.3em]">
                  <TypewriterText text="AGENT COMMAND CENTER v2.0.7" delay={30} />
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_10px_#00ff9d]" />
                <span className="text-xs text-gray-400">CONNECTED</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6 relative z-10">
        {/* Metrics */}
        <MetricsPanel agents={agents} />
        
        {/* Main grid */}
        <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-6 min-h-0">
          {/* Agent list */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between">
              <h2 className="font-['Orbitron'] text-sm tracking-[0.2em] text-[#00d4ff]">
                CONNECTED AGENTS
              </h2>
              <span className="text-xs text-gray-500">{agents.length} TOTAL</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Terminal */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between">
              <h2 className="font-['Orbitron'] text-sm tracking-[0.2em] text-[#00d4ff]">
                TERMINAL OUTPUT
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff006e]/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-[#00ff9d]/80" />
              </div>
            </div>
            <div className="flex-1 border border-[#1a1a2e] rounded-lg overflow-hidden bg-[#0a0a0f] min-h-[300px] lg:min-h-0">
              <TerminalOutput logs={logs} />
            </div>
            <CommandInput onSubmit={handleCommand} />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-sm z-10">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-3">
          <p className="text-center text-xs text-gray-600">
            Requested by <a href="https://twitter.com/0xBenjin" className="text-gray-500 hover:text-[#00d4ff] transition-colors">@0xBenjin</a> · Built by <a href="https://twitter.com/clonkbot" className="text-gray-500 hover:text-[#00ff9d] transition-colors">@clonkbot</a>
          </p>
        </div>
      </footer>
    </div>
  );
}