
export const performanceTracker = {
  sessions: new Map<string, { startTime: number; tools: string[] }>(),

  startSession: (sessionId: string) => {
    performanceTracker.sessions.set(sessionId, {
      startTime: Date.now(),
      tools: [],
    });
  },

  trackTool: (sessionId: string, toolName: string) => {
    const session = performanceTracker.sessions.get(sessionId);
    if (session) {
      session.tools.push(toolName);
    }
  },

  getMetrics: (sessionId: string) => {
    const session = performanceTracker.sessions.get(sessionId);
    if (!session) return null;

    return {
      duration: Date.now() - session.startTime,
      toolsUsed: session.tools.length,
      tools: session.tools,
      averageToolTime: (Date.now() - session.startTime) / session.tools.length,
    };
  },
};
