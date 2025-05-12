import { Themed } from '@/components'
import { Form, Stack } from '@/components/router-form'

const PrivacyScreen = () => {
  return (
    <Themed.ScrollView>
      <Stack.Screen
        options={{
          headerTitle: 'Privacy',
          headerBackTitle: 'Settings'
        }}
      />
      <Form.List>
        <Form.Section>
          <Form.Text systemImage="lock.shield">Privacy Policy</Form.Text>
          <Form.Text systemImage="doc.text.magnifyingglass">Request Report</Form.Text>
        </Form.Section>
      </Form.List>
    </Themed.ScrollView>
  )
}

export default PrivacyScreen
