// 点位数据结构
export interface Point {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    description?: string;
    tunnelCount?: number;
}

// 隧道数据结构
export interface Tunnel {
    id: string;
    pointId: string;
    name: string;
    length: number;
    status: 0 | 1; // 0: 异常, 1: 正常
    description?: string;
    keypointCount?: number;
}

// 关键点数据结构
export interface Keypoint {
    id: string;
    tunnelId: string;
    name: string;
    distance: number;
    longitude: number;
    latitude: number;
    description?: string;
    sectionImage?: string;
    sensorCount?: number;
    sensors?: Sensor[];
}

// 传感器数据结构
export interface Sensor {
    sensorId: string;
    type: 'strain' | 'displacement' | 'temperature';
}

// 列表查询参数
export interface QueryParams {
    pageNum?: number;
    pageSize?: number;
    pointId?: string;
    tunnelId?: string;
    name?: string;
}

// 列表响应结构
export interface ListResponse<T> {
    rows: T[];
    total: number;
} 