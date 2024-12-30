<template>
    <div class="app-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <el-page-header :icon="null" @back="goBack">
                        <template #content>
                            <span class="page-header-title">{{ pointName }} - 隧道管理</span>
                        </template>
                    </el-page-header>
                    <el-button type="primary" plain @click="handleAdd">新增隧道</el-button>
                </div>
            </template>

            <!-- 隧道列表 -->
            <el-table :data="tunnelList" style="width: 100%" v-loading="loading">
                <el-table-column prop="name" label="隧道名称">
                    <template #default="scope">
                        <router-link :to="'/tunnels/keypoint/' + scope.row.id">
                            {{ scope.row.name }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column prop="length" label="隧道长度(m)" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                            {{ scope.row.status === 1 ? '正常' : '异常' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="keypointCount" label="关键点数量" width="100" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="primary" @click="handleKeypoint(scope.row)">关键点配置</el-button>
                        <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 隧道表单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
            <el-form ref="tunnelFormRef" :model="tunnelForm" :rules="rules" label-width="80px">
                <el-form-item label="隧道名称" prop="name">
                    <el-input v-model="tunnelForm.name" placeholder="请输入隧道名称" />
                </el-form-item>
                <el-form-item label="隧道长度" prop="length">
                    <el-input-number v-model="tunnelForm.length" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="tunnelForm.status">
                        <el-radio :label="1">正常</el-radio>
                        <el-radio :label="0">异常</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="tunnelForm.description" type="textarea" placeholder="请输入隧道描述" />
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 数据定义
const loading = ref(false)
const pointName = ref('') // 点位名称
const tunnelList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const tunnelFormRef = ref(null)

const tunnelForm = ref({
    id: '',
    pointId: route.params.pointId,
    name: '',
    length: 0,
    status: 1,
    description: ''
})

// 表单校验规则
const rules = {
    name: [
        { required: true, message: '请输入隧道名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    length: [
        { required: true, message: '请输入隧道长度', trigger: 'blur' }
    ]
}

// 方法定义
const getTunnelList = async () => {
    loading.value = true
    try {
        // TODO: 调用获取隧道列表接口
        tunnelList.value = []
        // TODO: 获取点位名称
        pointName.value = '测试点位'
    } catch (error) {
        console.error('获取隧道列表失败:', error)
        ElMessage.error('获取隧道列表失败')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push('/tunnels/point')
}

const handleAdd = () => {
    dialogTitle.value = '新增隧道'
    tunnelForm.value = {
        id: '',
        pointId: route.params.pointId,
        name: '',
        length: 0,
        status: 1,
        description: ''
    }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    dialogTitle.value = '编辑隧道'
    tunnelForm.value = { ...row }
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确认删除隧道"${row.name}"吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            // TODO: 调用删除隧道接口
            ElMessage.success('删除成功')
            getTunnelList()
        } catch (error) {
            console.error('删除隧道失败:', error)
            ElMessage.error('删除隧道失败')
        }
    })
}

const handleKeypoint = (row) => {
    router.push(`/tunnels/keypoint/${row.id}`)
}

const submitForm = async () => {
    if (!tunnelFormRef.value) return

    await tunnelFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // TODO: 调用新增/更新隧道接口
                ElMessage.success(tunnelForm.value.id ? '更新成功' : '新增成功')
                dialogVisible.value = false
                getTunnelList()
            } catch (error) {
                console.error('保存隧道失败:', error)
                ElMessage.error('保存隧道失败')
            }
        }
    })
}

// 生命周期钩子
onMounted(() => {
    getTunnelList()
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
</style>