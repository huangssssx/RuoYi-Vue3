<template>
    <div class="app-container">
        <el-row :gutter="20">
            <!-- 左侧地图 -->
            <el-col :span="16">
                <el-card>
                    <div id="map" class="map-container"></div>
                </el-card>
            </el-col>

            <!-- 右侧点位列表 -->
            <el-col :span="8">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>点位列表</span>
                            <el-button type="primary" plain @click="handleAdd">新增点位</el-button>
                        </div>
                    </template>

                    <el-table :data="pointList" style="width: 100%" v-loading="loading">
                        <el-table-column prop="name" label="点位名称">
                            <template #default="scope">
                                <router-link :to="'/tunnels/tunnel/' + scope.row.id">
                                    {{ scope.row.name }}
                                </router-link>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180">
                            <template #default="scope">
                                <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button link type="primary" @click="handleTunnelConfig(scope.row)">隧道配置</el-button>
                                <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <!-- 点位表单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
            <el-form ref="pointFormRef" :model="pointForm" :rules="rules" label-width="80px">
                <el-form-item label="点位名称" prop="name">
                    <el-input v-model="pointForm.name" placeholder="请输入点位名称" />
                </el-form-item>
                <el-form-item label="经度" prop="longitude">
                    <el-input-number v-model="pointForm.longitude" :precision="6" :step="0.000001"
                        style="width: 100%" />
                </el-form-item>
                <el-form-item label="纬度" prop="latitude">
                    <el-input-number v-model="pointForm.latitude" :precision="6" :step="0.000001" style="width: 100%" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="pointForm.description" type="textarea" placeholder="请输入点位描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPoint, getPoint, addPoint, updatePoint, delPoint } from '@/api/tunnels'

const router = useRouter()

// 数据定义
const loading = ref(false)
const pointList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const pointFormRef = ref(null)

const pointForm = ref({
    id: '',
    name: '',
    longitude: null,
    latitude: null,
    description: ''
})

// 表单校验规则
const rules = {
    name: [
        { required: true, message: '请输入点位名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
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
const getPointList = async () => {
    loading.value = true
    try {
        const res = await listPoint(queryParams.value)
        pointList.value = res.rows
        total.value = res.total
    } catch (error) {
        console.error('获取点位列表失败:', error)
        ElMessage.error('获取点位列表失败')
    } finally {
        loading.value = false
    }
}

const handleAdd = () => {
    dialogTitle.value = '新增点位'
    pointForm.value = {
        id: '',
        name: '',
        longitude: null,
        latitude: null,
        description: ''
    }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    dialogTitle.value = '编辑点位'
    pointForm.value = { ...row }
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确认删除点位"${row.name}"吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            await delPoint(row.id)
            ElMessage.success('删除成功')
            getPointList()
        } catch (error) {
            console.error('删除点位失败:', error)
            ElMessage.error('删除点位失败')
        }
    })
}

const handleTunnelConfig = (row) => {
    router.push(`/tunnels/tunnel/${row.id}`)
}

const submitForm = async () => {
    if (!pointFormRef.value) return

    await pointFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (pointForm.value.id) {
                    await updatePoint(pointForm.value)
                    ElMessage.success('更新成功')
                } else {
                    await addPoint(pointForm.value)
                    ElMessage.success('新增成功')
                }
                dialogVisible.value = false
                getPointList()
            } catch (error) {
                console.error('保存点位失败:', error)
                ElMessage.error('保存点位失败')
            }
        }
    })
}

// 生命周期钩子
onMounted(() => {
    getPointList()
})
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 600px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>