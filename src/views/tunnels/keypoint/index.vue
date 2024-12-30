<template>
    <div class="app-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <el-page-header :icon="null" @back="goBack">
                        <template #content>
                            <span class="page-header-title">{{ tunnelName }} - 关键点管理</span>
                        </template>
                    </el-page-header>
                    <el-button type="primary" plain @click="handleAdd">新增关键点</el-button>
                </div>
            </template>

            <!-- 关键点列表 -->
            <el-table :data="keypointList" style="width: 100%" v-loading="loading">
                <el-table-column prop="name" label="关键点名称" />
                <el-table-column prop="distance" label="里程(m)" width="100" />
                <el-table-column label="横截面图" width="120">
                    <template #default="scope">
                        <el-image v-if="scope.row.sectionImage" :src="scope.row.sectionImage"
                            :preview-src-list="[scope.row.sectionImage]" fit="cover" class="section-image">
                            <template #error>
                                <div class="image-slot">
                                    <el-icon>
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>
                        <span v-else>暂无图片</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sensorCount" label="传感器数量" width="100" />
                <el-table-column label="坐标" width="200">
                    <template #default="scope">
                        <div>经度: {{ scope.row.longitude }}</div>
                        <div>纬度: {{ scope.row.latitude }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="scope">
                        <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="primary" @click="handleSensor(scope.row)">传感器配置</el-button>
                        <el-button link type="primary" @click="handleUpload(scope.row)">上传横截面</el-button>
                        <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 关键点表单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" destroy-on-close>
            <el-form ref="keypointFormRef" :model="keypointForm" :rules="rules" label-width="100px">
                <el-form-item label="关键点名称" prop="name">
                    <el-input v-model="keypointForm.name" placeholder="请输入关键点名称" />
                </el-form-item>
                <el-form-item label="里程" prop="distance">
                    <el-input-number v-model="keypointForm.distance" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-form-item label="经度" prop="longitude">
                    <el-input-number v-model="keypointForm.longitude" :precision="6" :step="0.000001"
                        style="width: 100%" />
                </el-form-item>
                <el-form-item label="纬度" prop="latitude">
                    <el-input-number v-model="keypointForm.latitude" :precision="6" :step="0.000001"
                        style="width: 100%" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="keypointForm.description" type="textarea" placeholder="请输入关键点描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 传感器配置弹窗 -->
        <el-dialog title="传感器配置" v-model="sensorVisible" width="800px" destroy-on-close>
            <el-form :model="sensorForm" label-width="100px">
                <el-form-item label="传感器列表">
                    <el-table :data="sensorForm.sensors" border style="width: 100%">
                        <el-table-column type="index" width="50" />
                        <el-table-column prop="sensorId" label="传感器ID">
                            <template #default="scope">
                                <el-input v-model="scope.row.sensorId" placeholder="请输入传感器ID" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" label="类型" width="180">
                            <template #default="scope">
                                <el-select v-model="scope.row.type" placeholder="请选择类型">
                                    <el-option label="应变" value="strain" />
                                    <el-option label="位移" value="displacement" />
                                    <el-option label="温度" value="temperature" />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="scope">
                                <el-button link type="danger" @click="removeSensor(scope.$index)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div style="margin-top: 10px;">
                        <el-button type="primary" @click="addSensor">添加传感器</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="sensorVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitSensorForm">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 横截面图上传弹窗 -->
        <el-dialog title="上传横截面图" v-model="uploadVisible" width="500px" destroy-on-close>
            <el-upload class="upload-demo" drag action="#" :http-request="handleImageUpload" :show-file-list="false"
                accept="image/*">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        只能上传jpg/png文件，且不超过5MB
                    </div>
                </template>
            </el-upload>
            <div v-if="previewImage" class="preview-image">
                <img :src="previewImage" alt="预览图">
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelUpload">取 消</el-button>
                    <el-button type="primary" @click="confirmUpload">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 数据定义
const loading = ref(false)
const tunnelName = ref('') // 隧道名称
const keypointList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const keypointFormRef = ref(null)
const sensorVisible = ref(false)
const uploadVisible = ref(false)
const previewImage = ref('')
const currentKeypointId = ref('')

const keypointForm = ref({
    id: '',
    tunnelId: route.params.tunnelId,
    name: '',
    distance: 0,
    longitude: null,
    latitude: null,
    description: ''
})

const sensorForm = ref({
    keypointId: '',
    sensors: []
})

// 表单校验规则
const rules = {
    name: [
        { required: true, message: '请输入关键点名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    distance: [
        { required: true, message: '请输入里程', trigger: 'blur' }
    ],
    longitude: [
        { required: true, message: '请输入经度', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < -180 || value > 180) {
                    callback(new Error('经度范围为-180~180'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    latitude: [
        { required: true, message: '请输入纬度', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < -90 || value > 90) {
                    callback(new Error('纬度范围为-90~90'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 方法定义
const getKeypointList = async () => {
    loading.value = true
    try {
        // TODO: 调用获取关键点列表接口
        keypointList.value = []
        // TODO: 获取隧道名称
        tunnelName.value = '测试隧道'
    } catch (error) {
        console.error('获取关键点列表失败:', error)
        ElMessage.error('获取关键点列表失败')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push(`/tunnels/tunnel/${route.params.tunnelId}`)
}

const handleAdd = () => {
    dialogTitle.value = '新增关键点'
    keypointForm.value = {
        id: '',
        tunnelId: route.params.tunnelId,
        name: '',
        distance: 0,
        longitude: null,
        latitude: null,
        description: ''
    }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    dialogTitle.value = '编辑关键点'
    keypointForm.value = { ...row }
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确认删除关键点"${row.name}"吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            // TODO: 调用删除关键点接口
            ElMessage.success('删除成功')
            getKeypointList()
        } catch (error) {
            console.error('删除关键点失败:', error)
            ElMessage.error('删除关键点失败')
        }
    })
}

const handleSensor = (row) => {
    sensorForm.value = {
        keypointId: row.id,
        sensors: row.sensors || []
    }
    sensorVisible.value = true
}

const addSensor = () => {
    sensorForm.value.sensors.push({
        sensorId: '',
        type: ''
    })
}

const removeSensor = (index) => {
    sensorForm.value.sensors.splice(index, 1)
}

const submitSensorForm = async () => {
    try {
        // TODO: 调用保存传感器配置接口
        ElMessage.success('保存成功')
        sensorVisible.value = false
        getKeypointList()
    } catch (error) {
        console.error('保存传感器配置失败:', error)
        ElMessage.error('保存传感器配置失败')
    }
}

const handleUpload = (row) => {
    currentKeypointId.value = row.id
    previewImage.value = row.sectionImage
    uploadVisible.value = true
}

const handleImageUpload = async (params) => {
    const file = params.file
    // 文件类型校验
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        ElMessage.error('只能上传JPG/PNG格式的图片')
        return
    }
    // 文件大小校验
    if (file.size / 1024 / 1024 > 5) {
        ElMessage.error('图片大小不能超过5MB')
        return
    }
    // 预览图片
    previewImage.value = URL.createObjectURL(file)
}

const cancelUpload = () => {
    previewImage.value = ''
    uploadVisible.value = false
}

const confirmUpload = async () => {
    if (!previewImage.value) {
        ElMessage.warning('请先上传图片')
        return
    }
    try {
        // TODO: 调用上传图片接口
        ElMessage.success('上传成功')
        uploadVisible.value = false
        getKeypointList()
    } catch (error) {
        console.error('上传图片失败:', error)
        ElMessage.error('上传图片失败')
    }
}

const submitForm = async () => {
    if (!keypointFormRef.value) return

    await keypointFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // TODO: 调用新增/更新关键点接口
                ElMessage.success(keypointForm.value.id ? '更新成功' : '新增成功')
                dialogVisible.value = false
                getKeypointList()
            } catch (error) {
                console.error('保存关键点失败:', error)
                ElMessage.error('保存关键点失败')
            }
        }
    })
}

// 生命周期钩子
onMounted(() => {
    getKeypointList()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-header-title {
    font-size: 16px;
    font-weight: bold;
}

.section-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
}

.preview-image {
    margin-top: 20px;
    text-align: center;
}

.preview-image img {
    max-width: 100%;
    max-height: 300px;
}
</style>