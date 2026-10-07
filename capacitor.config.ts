import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.assuretechnologies.technician',
  appName: 'Assure Technician',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'assuretechnologies-backend-production.up.railway.app'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
