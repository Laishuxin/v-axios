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

  <div>
    <h1>
      测试基础的拦截器
    </h1>
    <el-button @click="handleTestRequestInterceptor()">
      测试请求拦截器
    </el-button>

    <el-button @click="handleTestResponseInterceptor()">
      测试响应拦截器
    </el-button>

    <el-button @click="handleTestResponseCatchInterceptor()">
      测试响应异常拦截器
    </el-button>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { VAxios } from '../../lib/src/v-axios'

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

    const handleTestRequestInterceptor = () => {
      const vAxios = new VAxios({
        transform: {
          requestInterceptors(config, options) {
            const headers = config.headers
            headers['Authorization'] = `Bearer fake token`
            config.headers = headers

            // 注意返回 config，否则无法执行
            return config
          },
        },
      })

      // 不推荐直接用 _axiosInstance 发起请求，后面会优化
      vAxios._axiosInstance
        .request({
          url: '/api/data',
        })
        .then((res) => {
          console.log('res: ', res)
        })
    }

    const handleTestResponseInterceptor = () => {
      const vAxios = new VAxios({
        transform: {
          responseInterceptors(res) {
            const { data } = res
            if (data.code == 200) return data.result
            throw new Error(data.message)
          },
        },
      })

      // 不推荐直接用 _axiosInstance 发起请求，后面会优化
      vAxios._axiosInstance
        .request({
          url: '/api/data',
        })
        .then((res) => {
          console.log('res: ', res)
        })
    }

    const handleTestResponseCatchInterceptor = () => {
      const vAxios = new VAxios({
        transform: {
          responseInterceptorsCatch(instance, error) {
            console.log('捕获异常: ', error)
            throw error
          },
        },
      })

      // 不推荐直接用 _axiosInstance 发起请求，后面会优化
      vAxios._axiosInstance.request({
        url: '/not-found',
      })
    }

    return {
      handleRequest,
      handleTestRequestInterceptor,
      handleTestResponseInterceptor,
      handleTestResponseCatchInterceptor,
    }
  },
}
</script>

<style lang="scss" scoped></style>
