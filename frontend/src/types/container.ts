export type ContainerState = "running" | "exited" | "paused" | "restarting";

export interface PortMapping {
  host_ip: string;
  host_port: number;
  container_port: number;
  protocol: "tcp" | "udp";
  is_public: boolean;
}

export interface VolumeMount {
  source: string;
  destination: string;
  mode: "ro" | "rw";
  is_sensitive: boolean;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerState;
  created_at: string;
  user: string;
  is_root: boolean;
  privileged: boolean;
  read_only_rootfs: boolean;
  network_mode: string;
  ports: PortMapping[];
  mounts: VolumeMount[];
  capabilities_added: string[];
  capabilities_dropped: string[];
  findings_count: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  last_scan: string;
}
