package expo.modules.sykamoreui

import android.annotation.SuppressLint
import android.content.Context
import android.text.format.DateFormat
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDefaults
import androidx.compose.material3.DisplayMode
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
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
import android.graphics.Color

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
  val mode: MutableState<String> = mutableStateOf("date"),
  val variant: MutableState<String> = mutableStateOf("picker"),
  val showVariantToggle: MutableState<Boolean> = mutableStateOf(true),
  val is24Hour: MutableState<Boolean?> = mutableStateOf(null),
  val color: MutableState<Color?> = mutableStateOf(null),
  val modifiers: MutableState<List<ExpoModifier>> = mutableStateOf(emptyList())
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
      initialSelectedDateMillis = props.initialDate.value ?: Date().time,
      initialDisplayMode = if (props.variant.value == "input") {
        DisplayMode.Input
      } else {
        DisplayMode.Picker
      }
    )
    val mode = props.mode.value
    val context = LocalContext.current
    val confirmText = props.confirmText.value
    val dismissText = props.dismissText.value
    val tintColor = props.color.value.composeOrNull
    val modifiers = Modifier.fromExpoModifiers(props.modifiers.value)

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
          val is24Hour = props.is24Hour.value ?: DateFormat.is24HourFormat(context)
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
            val timePickerColors = tintColor?.let {
              TimePickerDefaults.colors(
                selectorColor = it,
                timeSelectorSelectedContainerColor = it,
                clockDialColor = it.copy(alpha = 0.3f)
              )
            } ?: TimePickerDefaults.colors()
            TimePicker(
              state = timePickerState,
              modifier = modifiers,
              colors = timePickerColors
            )
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
            val datePickerColors = tintColor?.let {
              DatePickerDefaults.colors(
                titleContentColor = it,
                selectedDayContainerColor = it,
                todayDateBorderColor = it,
                headlineContentColor = it
              )
            } ?: DatePickerDefaults.colors()
            DatePicker(
              state = datePickerState,
              modifier = modifiers,
              showModeToggle = props.showVariantToggle.value,
              colors = datePickerColors
            )
          }
        }
      }
    }
  }
}
