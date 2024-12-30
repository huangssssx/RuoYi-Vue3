import request from '@/utils/request'

// 点位相关接口
export function listPoint(query) {
    return request({
        url: '/tunnels/point/list',
        method: 'get',
        params: query
    })
}

export function getPoint(id) {
    return request({
        url: `/tunnels/point/${id}`,
        method: 'get'
    })
}

export function addPoint(data) {
    return request({
        url: '/tunnels/point',
        method: 'post',
        data: data
    })
}

export function updatePoint(data) {
    return request({
        url: '/tunnels/point',
        method: 'put',
        data: data
    })
}

export function delPoint(id) {
    return request({
        url: `/tunnels/point/${id}`,
        method: 'delete'
    })
}

// 隧道相关接口
export function listTunnel(query) {
    return request({
        url: '/tunnels/tunnel/list',
        method: 'get',
        params: query
    })
}

export function getTunnel(id) {
    return request({
        url: `/tunnels/tunnel/${id}`,
        method: 'get'
    })
}

export function addTunnel(data) {
    return request({
        url: '/tunnels/tunnel',
        method: 'post',
        data: data
    })
}

export function updateTunnel(data) {
    return request({
        url: '/tunnels/tunnel',
        method: 'put',
        data: data
    })
}

export function delTunnel(id) {
    return request({
        url: `/tunnels/tunnel/${id}`,
        method: 'delete'
    })
}

// 关键点相关接口
export function listKeypoint(query) {
    return request({
        url: '/tunnels/keypoint/list',
        method: 'get',
        params: query
    })
}

export function getKeypoint(id) {
    return request({
        url: `/tunnels/keypoint/${id}`,
        method: 'get'
    })
}

export function addKeypoint(data) {
    return request({
        url: '/tunnels/keypoint',
        method: 'post',
        data: data
    })
}

export function updateKeypoint(data) {
    return request({
        url: '/tunnels/keypoint',
        method: 'put',
        data: data
    })
}

export function delKeypoint(id) {
    return request({
        url: `/tunnels/keypoint/${id}`,
        method: 'delete'
    })
}

// 传感器相关接口
export function saveSensors(data) {
    return request({
        url: '/tunnels/keypoint/sensors',
        method: 'post',
        data: data
    })
}

// 横截面图上传接口
export function uploadSectionImage(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: `/tunnels/keypoint/${id}/section-image`,
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
} 