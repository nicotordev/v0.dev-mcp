export const performanceMetricsResource = {
  name: "performance-metrics",
  uri: "v0://performance",
  handler: async () => ({
    contents: [
      {
        uri: "v0://performance",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            server_info: {
              version: "2.0.0",
              uptime: process.uptime(),
              memory_usage: process.memoryUsage(),
              node_version: process.version,
              platform: process.platform,
            },
            active_sessions: 0, // This will be dynamically updated later if needed
            available_tools: [
              "generate_webapp",
              "enhance_code",
              "debug_code",
              "generate_component",
              "analyze_refactor_code",
              "generate_database_schema",
              "generate_api_endpoints",
              "generate_tests",
              "generate_cicd_pipeline",
              "optimize_performance",
              "security_audit",
            ],
            features: {
              streaming_enabled: true,
              performance_tracking: true,
              security_auditing: true,
              database_generation: true,
              test_generation: true,
              cicd_automation: true,
            },
          },
          null,
          2
        ),
      },
    ],
  }),
}; 