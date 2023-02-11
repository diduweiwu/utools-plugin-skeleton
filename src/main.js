import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {create, NButton, NConfigProvider, NLayout, NLayoutHeader, NMessageProvider, NSpace,} from 'naive-ui'

const naive = create({
    components: [
        NButton,
        NLayout,
        NLayoutHeader,
        NMessageProvider,
        NSpace, NConfigProvider,
    ]
})
createApp(App).use(naive).mount('#app')
