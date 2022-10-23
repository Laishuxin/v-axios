<template>
  <div>
    <h1>Welcome</h1>
  </div>

  <div>
    <h1>使用原始的 axios 发起请求</h1>
    <el-button @click="handleRequest">
      使用原始的 axios 发起请求
    </el-button>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const handleRequest = () => {
      axios
        .request({
          method: 'get',
          url: '/api/data',
        })
        .then((res) => {
          const data = res.data
          if (data.code != 200) {
            throw new Error(data.message)
          } else {
            return data.result
          }
        })
        .then((data) => {
          ElMessage({
            type: 'success',
            message: `请求成功，数据为：${JSON.stringify(data)}`,
          })
        })
    }

    return {
      handleRequest,
    }
  },
}
</script>

<style lang="scss" scoped></style>
