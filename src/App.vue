<script>
import {darkTheme, useOsTheme} from "naive-ui";
import {computed} from "vue";


export default {
  setup() {

    const osThemeRef = useOsTheme();

    return {
      theme: computed(() => osThemeRef.value === "dark" ? darkTheme : null),
    }
  }
}
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider placement="top" container-style="margin-top:50px" :duration="1500" closable>
      <n-layout position="absolute">
        <n-layout-header style="height: 50px;" bordered>
          <n-space justify="space-between" align="center" style="height: 50px;padding:0 10px">
            功能区域
          </n-space>
        </n-layout-header>
        <n-layout has-sider position="absolute" style="top: 60px">
          <n-layout content-style="padding: 5px 10px;" :native-scrollbar="false">
            内容区域
          </n-layout>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>

</template>

<style scoped>

</style>

<style>

</style>
