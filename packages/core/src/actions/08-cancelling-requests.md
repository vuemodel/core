<script setup>
import CancelActionRaw from './examples/CancelAction.vue?raw'
import CancelAction from './examples/CancelAction.vue'
</script>

# Cancelling Requests
Got some long running requests that may need to be cancelled? Or maybe you want to cancel a request when the user navigates to another page?

For that, we can use an `AbortController` to cancel requests.

::: info
Cancelling a request is far easier when using composables. The controller/signal is handled for you behind the scenes :blush:
:::

<ExamplePanel
  title="Cancelling An Action"
  :content="CancelActionRaw"
  :exampleComponent="CancelAction"
/>

[Learn more about signals/controllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)