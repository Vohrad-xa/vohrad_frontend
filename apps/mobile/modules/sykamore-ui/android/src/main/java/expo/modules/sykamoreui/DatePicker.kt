package expo.modules.sykamoreui

import android.annotation.SuppressLint
import android.content.Context
import android.text.format.DateFormat
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ComposableScope
import expo.modules.kotlin.views.ExpoComposeView
import java.util.Calendar
import java.util.Date

@Composable
private fun DialogActionButton(label: String, onClick: () -> Unit) {
  StyledButton(
    variant = ButtonVariant.BORDERLESS,
    colors = ButtonColors(),
    disabled = false,
    onPress = onClick
  ) {
    Text(label)
  }
}

@Composable
private fun PickerDialog(
  confirmText: String,
  dismissText: String,
  onConfirm: () -> Unit,
  onDismissRequest: () -> Unit,
  content: @Composable () -> Unit
) {
  AlertDialog(
    onDismissRequest = onDismissRequest,
    confirmButton = { DialogActionButton(confirmText, onConfirm) },
    dismissButton = { DialogActionButton(dismissText, onDismissRequest) },
    text = content
  )
}

data class DatePickerResult(
  @Field
  val date: Long?
) : Record

data class DatePickerProps(
  val initialDate: MutableState<Long?> = mutableStateOf(null),
  val confirmText: MutableState<String> = mutableStateOf("OK"),
  val dismissText: MutableState<String> = mutableStateOf("Cancel"),
  val mode: MutableState<String> = mutableStateOf("date")
) : ComposeProps

@SuppressLint("ViewConstructor")
@OptIn(ExperimentalMaterial3Api::class)
class DatePickerView(context: Context, appContext: AppContext) :
  ExpoComposeView<DatePickerProps>(context, appContext, withHostingView = true) {
  override val props = DatePickerProps()
  private val onDateSelected by EventDispatcher<DatePickerResult>()
  private val onDismiss by EventDispatcher()

  @Composable
  override fun ComposableScope.Content() {
    var showDialog by remember { mutableStateOf(true) }
    val datePickerState = rememberDatePickerState(
      initialSelectedDateMillis = props.initialDate.value ?: Date().time
    )
    val mode = props.mode.value
    val context = LocalContext.current
    val confirmText = props.confirmText.value
    val dismissText = props.dismissText.value

    LaunchedEffect(showDialog) {
      if (!showDialog) {
        onDismiss(emptyMap<String, Any>())
      }
    }

    if (showDialog) {
      DynamicTheme {
        if (mode == "time") {
          val baseTime = props.initialDate.value ?: Date().time
          val calendar = remember(baseTime) {
            Calendar.getInstance().apply { timeInMillis = baseTime }
          }
          val is24Hour = DateFormat.is24HourFormat(context)
          val timePickerState = rememberTimePickerState(
            initialHour = calendar.get(Calendar.HOUR_OF_DAY),
            initialMinute = calendar.get(Calendar.MINUTE),
            is24Hour = is24Hour
          )

          PickerDialog(
            confirmText = confirmText,
            dismissText = dismissText,
            onConfirm = {
              val result = Calendar.getInstance().apply {
                timeInMillis = baseTime
                set(Calendar.HOUR_OF_DAY, timePickerState.hour)
                set(Calendar.MINUTE, timePickerState.minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
              }
              onDateSelected(DatePickerResult(date = result.timeInMillis))
              showDialog = false
            },
            onDismissRequest = {
              showDialog = false
            }
          ) {
            TimePicker(state = timePickerState)
          }
        } else {
          PickerDialog(
            confirmText = confirmText,
            dismissText = dismissText,
            onConfirm = {
              onDateSelected(DatePickerResult(date = datePickerState.selectedDateMillis))
              showDialog = false
            },
            onDismissRequest = {
              showDialog = false
            }
          ) {
            DatePicker(state = datePickerState)
          }
        }
      }
    }
  }
}
