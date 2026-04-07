import type { PropertyClass } from "@/lib/property-data";

export const manualSeventhOverrides: Record<string, PropertyClass> = {
  "activity-presentation": {
    name: "ACTIVITY.PRESENTATION",
    slug: "activity-presentation",
    fields: [
      {
        name: "PROPERTY.CLASS",
        slot: 3,
        details: [
          "Danh sách property class mà rule presentation áp vào.",
          "Validate bắt buộc dòng class này phải đi kèm version class tương ứng và không được lặp."
        ]
      },
      {
        name: "CLASS.VERSION",
        slot: 4,
        details: [
          "Version của từng property class ở trên.",
          "Source dùng field này để buộc mapping đúng class version trước khi cho lưu."
        ]
      },
      {
        name: "PROPERTY",
        slot: 6,
        details: [
          "Property cụ thể cần áp quy tắc hiển thị.",
          "Nếu dùng mức property thì validate cũng bắt version property tương ứng."
        ]
      },
      {
        name: "PROP.VERSION",
        slot: 7,
        details: [
          "Version của property cụ thể.",
          "Được đối chiếu với `PROPERTY` để tránh gắn rule presentation vào sai version."
        ]
      },
      {
        name: "ACTIVITY.ID",
        slot: 9,
        details: [
          "Activity id mà quy tắc hiển thị này nhắm tới.",
          "Nếu khai báo activity property hoặc version thì field này phải có."
        ]
      },
      {
        name: "ACT.PROPERTY",
        slot: 10,
        details: [
          "Property nằm trong activity cần ẩn hoặc đổi cách nhìn.",
          "Validate đọc cặp activity id và activity property để bảo đảm không tạo dòng mồ côi."
        ]
      },
      {
        name: "ACT.VERSION",
        slot: 11,
        details: [
          "Version của property trong activity.",
          "Chỉ có ý nghĩa khi đi cùng `ACTIVITY.ID` và `ACT.PROPERTY`."
        ]
      },
      {
        name: "SUPPRESS.SEE.MODE",
        slot: 13,
        details: [
          "Cờ tắt chế độ see-mode của presentation rule.",
          "Field này là công tắc hiển thị tổng quát thay vì nhắm vào một field nghiệp vụ riêng."
        ]
      },
      {
        name: "HIDE.ACTIVITY",
        slot: 14,
        details: [
          "Danh sách activity cần ẩn khỏi presentation.",
          "Validate lặp từng dòng, kiểm tra trùng và không cho nhập activity ẩn bị lặp lại."
        ]
      },
      {
        name: "HIDE.PROPERTY",
        slot: 15,
        details: [
          "Danh sách property cần ẩn khỏi màn hình activity.",
          "Source chuẩn hóa class của property ẩn và kiểm tra trùng từng dòng."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACTIVITY.PRESENTATION",
        routine: "AA.ACTIVITY.PRESENTATION.UPDATE.b",
        summary: "Action này không tự ghi bảng business; nó chỉ đánh dấu arrangement còn thay đổi presentation chưa authorise bằng `AA.Framework.UpdateChangeCondition()`.",
        steps: [
          "Bước 1: đọc context activity hiện tại từ `AF.Framework`: status, arrangement activity id, activity record, action, effective date và arrangement id.",
          "Bước 2: lấy property hiện hành bằng `AF.Framework.getPropertyId()` và reset cờ lỗi `RET.ERROR`, `PROCESS.ERROR`.",
          "Bước 3: nếu status là `UNAUTH`, gọi `AA.Framework.UpdateChangeCondition()` để cập nhật change-condition cho arrangement.",
          "Bước 4: nếu status là `DELETE` hoặc `REVERSE`, cũng chỉ gọi lại `AA.Framework.UpdateChangeCondition()`; nhánh `AUTH` không có write business nào trong source.",
          "Bước 5: nếu có lỗi từ common thì đưa lỗi vào end-error qua `EB.ErrorProcessing.StoreEndError()` và ghi debug log."
        ],
        flow: [
          "Không thấy `READ` hoặc `WRITE` trực tiếp vào bảng nghiệp vụ trong routine này.",
          "Tác động thật nằm ở change-condition do common framework quản lý."
        ]
      }
    ]
  },
  "activity-restriction": {
    name: "ACTIVITY.RESTRICTION",
    slug: "activity-restriction",
    fields: [
      {
        name: "RULE.NAME",
        slot: 3,
        details: [
          "Tên từng rule restriction để các nhóm expression và kết quả bám vào đúng dòng.",
          "Các routine `OVERRIDES` và `PROP.EVALUATE` đều locate rule theo field này."
        ]
      },
      {
        name: "PERIODIC.ATTRIBUTE",
        slot: 4,
        details: [
          "Thuộc tính định kỳ được dùng khi evaluate rule theo chu kỳ.",
          "Validate bắt field này phải hợp lệ khi property khai báo periodic review."
        ]
      },
      {
        name: "RULE.ACTIVITY.CLASS",
        slot: 5,
        details: [
          "Activity class làm điều kiện kích hoạt restriction.",
          "Guard routine dùng danh sách này để quyết định có cho `EVALUATE` chạy hay không."
        ]
      },
      {
        name: "RULE.ACTIVITY.ID",
        slot: 6,
        details: [
          "Activity id kích hoạt restriction ở mức chi tiết hơn class.",
          "Override và guard đều đọc field này để match với activity đang chạy."
        ]
      },
      {
        name: "RULE.SET",
        slot: 12,
        details: [
          "Tên rule set nghiệp vụ sẽ được execute.",
          "Field này liên kết restriction với engine rule chứ không phải chỉ là nhãn mô tả."
        ]
      },
      {
        name: "RULE.EXPRESSION",
        slot: 13,
        details: [
          "Biểu thức so sánh của rule.",
          "Dùng cùng `RULE.EVALUATION` và `DEFAULT.RESULT` để ra quyết định waive, break hay satisfy."
        ]
      },
      {
        name: "DEFAULT.RESULT",
        slot: 15,
        details: [
          "Kết quả mặc định khi expression không trả được nhánh cụ thể.",
          "Là fallback result cho engine evaluate."
        ]
      },
      {
        name: "ACTIVITY.CLASS",
        slot: 18,
        details: [
          "Activity class bị hạn chế ở nhánh action-level.",
          "Khác với `RULE.ACTIVITY.CLASS` là field này mô tả activity sẽ bị chặn hoặc override."
        ]
      },
      {
        name: "RESTRICT.TYPE",
        slot: 23,
        details: [
          "Kiểu phản ứng khi restriction trúng rule, thường là lỗi hoặc override/log.",
          "Validate xử lý field này để quyết định có cần thông tin bổ sung hay không."
        ]
      },
      {
        name: "RESTRICT.ERROR",
        slot: 25,
        details: [
          "Mã lỗi hoặc thông điệp nghiệp vụ dùng khi restriction chặn activity.",
          "Là đầu ra cuối cùng được dùng để trả về cho user hoặc log restriction."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACTIVITY.RESTRICTION",
        routine: "AA.ACTIVITY.RESTRICTION.UPDATE.b",
        summary: "Action update không trực tiếp sửa bảng restriction; nó điều khiển lịch review định kỳ và cập nhật change-condition của arrangement.",
        steps: [
          "Bước 1: đọc status activity, AAA id, activity record, current action, effective date và arrangement id từ `AF.Framework` và `AA.Framework`.",
          "Bước 2: lấy property hiện hành bằng `AF.Framework.getPropertyId()` rồi reset `RET.ERROR`, `PROCESS.ERROR`.",
          "Bước 3: ở `UNAUTH`, gọi `AA.ActivityRestriction.ActivityRestrictionMaintain()` để set hoặc reschedule periodic review, sau đó gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 4: ở `DELETE`, cũng gọi `ActivityRestrictionMaintain()` nhưng với ngữ cảnh xóa để bỏ lịch review cũ rồi update change-condition.",
          "Bước 5: ở `REVERSE`, gọi lại `ActivityRestrictionMaintain()` để khôi phục lịch theo context trước đó và cập nhật change-condition; `AUTH` không có write business trực tiếp."
        ],
        flow: [
          "Routine này không tự `WRITE` file business; phần lịch được đẩy sang `MAINTAIN`, còn flag thay đổi được đẩy sang common framework."
        ]
      },
      {
        name: "MAINTAIN ACTIVITY.RESTRICTION",
        routine: "AA.ACTIVITY.RESTRICTION.MAINTAIN.b",
        summary: "Routine này tính ngày review kế tiếp và ghi vào `AA.SCHEDULED.ACTIVITY` để hệ thống tự chạy periodic review của restriction.",
        steps: [
          "Bước 1: đọc review frequency hiện tại và cũ từ record restriction mới/cũ.",
          "Bước 2: đọc property `ACCOUNT` bằng `AA.ProductFramework.GetPropertyRecord(...)` để lấy `DATE.CONVENTION`, `DATE.ADJUSTMENT` và `BUSINESS.DAY` phục vụ tính cycle date.",
          "Bước 3: nếu cần reschedule, gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE` từ effective date hoặc last review date.",
          "Bước 4: gọi `AA.Framework.SetScheduledActivity(ARRANGEMENT.ID, REVIEW.ACTIVITY, NEXT.CYCLED.DATE, MODE, RET.ERROR)` để tạo, sửa hoặc xóa lịch trên `AA.SCHEDULED.ACTIVITY`.",
          "Bước 5: ở delete/reverse, đọc context cũ bằng `AA.Framework.GetContextHistoryDetails(...)` rồi tính lại lịch từ dữ liệu trước khi write scheduled activity."
        ],
        flow: [
          "Bảng bị tác động rõ nhất là `AA.SCHEDULED.ACTIVITY` qua API framework, không phải do `WRITE` trực tiếp trong source."
        ]
      },
      {
        name: "EVALUATE ACTIVITY.RESTRICTION",
        routine: "AA.ACTIVITY.RESTRICTION.EVALUATE.b",
        summary: "Đây là action chạy rule restriction thật: evaluate điều kiện, xóa charge deferred khi reverse/delete, và khi auth thì trigger activity hành động tiếp theo.",
        steps: [
          "Bước 1: ở `UNAUTH`, gọi `AA.ActivityRestriction.EvaluateActivityRestriction(ArrangementId, PropertyId, '', EffectiveDate, '', '', '')` để chạy engine restriction trên arrangement hiện tại.",
          "Bước 2: sau evaluate, routine xóa giá trị trong các standard periodic attributes của `R.NEW` để tránh hệ thống lặp lại periodic evaluation khi ghi record.",
          "Bước 3: ở `DELETE` hoặc `REVERSE`, lặp danh sách deferred charge id trong property restriction, gọi `AA.ActivityCharges.ProcessChargeDetails(..., 'DELETE', 'ACTIVITY', ...)` để xóa chi tiết charge đang treo; nếu full status là `DELETE` thì còn gọi `AA.ActivityRestriction.UpdateRuleSetEvaluationDetails('DELETE', '')`.",
          "Bước 4: ở `AUTH`, nếu full status là `AUTH` thì gọi `AA.ActivityRestriction.TriggerActionActivity(ArrangementId, EffectiveDate, '', RetError)` để tạo activity tiếp theo theo kết quả restriction.",
          "Bước 5: toàn bộ lỗi được dồn về end-error khi `RET.ERROR` có giá trị."
        ],
        flow: [
          "Có đụng tới chi tiết charge deferred qua `AA.ActivityCharges.ProcessChargeDetails(...)`.",
          "Kết quả evaluate và action tiếp theo được đẩy sang common restriction APIs thay vì tự write bảng trong routine này."
        ]
      },
      {
        name: "ALTERNATE ACTIVITY.RESTRICTION",
        routine: "AA.ACTIVITY.RESTRICTION.ALTERNATE.b",
        summary: "Nhánh alternate dùng để chuyển accrual từ property gốc sang property thay thế và dựng secondary activity giữ trạng thái suppress.",
        steps: [
          "Bước 1: ở `UNAUTH`, lấy `ORIGINAL.PROP` và `ALTERNATE.PROP` từ `R.NEW` theo từng dòng.",
          "Bước 2: resolve class của từng property; chỉ khi cả hai đều là `INTEREST` thì tiếp tục xử lý.",
          "Bước 3: gọi `AA.Interest.UpdateInterestAccruals('VAL', ARRANGEMENT.ID, ORIGINAL.PROP, ..., ALTERNATE.PROP, ..., UPD.MODE='ALTERNATE', '')` để chuyển chi tiết accrual từ interest gốc sang interest alternate.",
          "Bước 4: dựng secondary maintain activity để set `SUPPRESS.ACCRUAL = ALTERNATE` cho property thay thế, nhờ đó interest alternate không accrue như interest thường.",
          "Bước 5: nếu có lỗi từ cập nhật accrual hoặc secondary activity thì đẩy vào end-error."
        ],
        flow: [
          "Điểm ghi rõ nhất là update interest accruals qua API `AA.Interest.UpdateInterestAccruals(...)`.",
          "Nhánh này không tự ghi file restriction mà chủ yếu chuyển ảnh hưởng sang property `INTEREST`."
        ]
      },
      {
        name: "EVALUATE.GUARD ACTIVITY.RESTRICTION",
        routine: "AA.ACTIVITY.RESTRICTION.EVALUATE.GUARD.b",
        summary: "Guard routine chỉ quyết định action evaluate có cần chạy hay không dựa trên activity class/id và setup restriction hiện có.",
        steps: [
          "Bước 1: mặc định `ProcessAction = 1`, sau đó lấy activity name và current activity từ context.",
          "Bước 2: dùng `AA.Framework.CheckActivityClass(...)` để xác định activity hiện tại thuộc class nào.",
          "Bước 3: nếu cần, đọc record restriction hiện hành qua `AA.ProductFramework.GetPropertyRecord(...)`.",
          "Bước 4: so khớp `RULE.ACTIVITY.CLASS` và `RULE.ACTIVITY.ID`; nếu không có setup phù hợp thì đặt `ProcessAction = 0`.",
          "Bước 5: riêng `PERIODIC.REVIEW` luôn được cho chạy để không bỏ qua chu kỳ restriction."
        ],
        flow: [
          "Routine này chỉ đọc context và property record, không write bảng nghiệp vụ."
        ]
      }
    ]
  },
  alerts: {
    name: "ALERTS",
    slug: "alerts",
    fields: [
      {
        name: "EVENT",
        slot: 3,
        details: [
          "Loại sự kiện alert sẽ được đăng ký hoặc evaluate.",
          "Action `EVALUATE` đếm các event type này từ activity class rồi mới quyết định raise alert."
        ]
      },
      {
        name: "FIELD",
        slot: 4,
        details: [
          "Field nghiệp vụ được lấy ra để so điều kiện alert.",
          "Đi theo từng dòng event criteria chứ không phải field tổng quát của property."
        ]
      },
      {
        name: "OPERAND",
        slot: 5,
        details: [
          "Toán tử so sánh cho điều kiện alert.",
          "Được dùng cùng `FIELD` và `VALUE` để xác định event có thật sự xảy ra hay không."
        ]
      },
      {
        name: "VALUE",
        slot: 6,
        details: [
          "Giá trị mục tiêu hoặc ngưỡng để đánh giá alert.",
          "Trong evaluate, linked value được dựng từ arrangement và activity record để phục vụ so sánh này."
        ]
      },
      {
        name: "ROLE",
        slot: 7,
        details: [
          "Vai trò người nhận hoặc vai trò customer liên quan đến event alert.",
          "Giúp route alert tới đúng nhóm nhận thông báo."
        ]
      },
      {
        name: "SUBSCRIBED",
        slot: 8,
        details: [
          "Cờ cho biết request hiện tại đã đăng ký alert hay chưa.",
          "Record routine khóa field này ở chế độ `NOINPUT` để người dùng không sửa trực tiếp."
        ]
      },
      {
        name: "REQUEST.ID",
        slot: 9,
        details: [
          "Mã request/handoff của subscription alert.",
          "Record routine cũng khóa field này ở `NOINPUT`."
        ]
      }
    ],
    actions: [
      {
        name: "EVALUATE ALERTS",
        routine: "AA.ALERTS.EVALUATE.b",
        summary: "Action authorise của alert đọc activity class hiện tại, dựng linked value từ arrangement/activity rồi gọi TEC để phát sinh alert event.",
        steps: [
          "Bước 1: đọc activity status, full status, AAA id, activity record, action, effective date và arrangement id từ context framework.",
          "Bước 2: ở `AUTH`, bỏ qua ngay nếu activity là reversal master, đang chạy simulation, hoặc arrangement status hiện tại là `CLOSE`.",
          "Bước 3: lấy activity currency từ arrangement activity record để support multi-currency property.",
          "Bước 4: resolve current activity class bằng `AA.ProductFramework.GetActivityClass(...)`, rồi đếm số `AccAlertEventType` trên activity class record.",
          "Bước 5: nếu có event, gọi `GET.IMAGE.RECORD` để lấy before/after image của property nguồn, gọi `GET.LINKED.VALUE` để dựng `LINKED.VALUE` chứa `AA.ARRANGEMENT` và `AA.ACTIVITY`, rồi gọi `CALL.TEC.RECORD.EVENT` để ghi alert/event ra TEC."
        ],
        flow: [
          "Routine này không tự `WRITE` bảng business của AA; nó handoff sang TEC/alert processing để phát sinh thông báo.",
          "Nguồn dữ liệu chính để raise alert là record `AA.ARRANGEMENT`, activity record hiện tại và activity class record."
        ]
      },
      {
        name: "SUBSCRIBE ALERTS",
        routine: "AA.ALERTS.SUBSCRIBE.b",
        summary: "Source hiện chỉ cho thấy shell action theo status; chưa có bước business read/write riêng trong các nhánh input, auth, delete hay reverse.",
        steps: [
          "Bước 1: routine đọc status, current action và context activity như một action chuẩn.",
          "Bước 2: các nhánh `UNAUTH`, `DELETE`, `AUTH`, `REVERSE` hiện không chứa xử lý business cụ thể trong source đã đọc.",
          "Bước 3: nếu phát sinh lỗi từ common framework thì routine mới đẩy lỗi vào end-error."
        ],
        flow: [
          "Phần có tác động rõ ràng hơn của property này nằm ở `EVALUATE` và `RECORD`, không phải `SUBSCRIBE`."
        ]
      }
    ]
  },
  "az-accounting": {
    name: "AZ.ACCOUNTING",
    slug: "az-accounting",
    fields: [
      {
        name: "DR.TXN.CODE",
        slot: 3,
        details: [
          "Transaction code ghi debit principal hoặc accounting debit chuẩn của AZ mapping.",
          "Đây là mã classic transaction được gọi ra khi AA cần post nghiệp vụ debit."
        ]
      },
      {
        name: "CR.TXN.CODE",
        slot: 4,
        details: [
          "Transaction code ghi credit chuẩn.",
          "Đi cặp với `DR.TXN.CODE` để map hai chiều hạch toán classic."
        ]
      },
      {
        name: "INT.DR.CAP",
        slot: 5,
        details: [
          "Transaction code dùng khi capitalise lãi theo chiều debit.",
          "Tách riêng khỏi transaction code principal thường."
        ]
      },
      {
        name: "CHARGE.DR.TXN",
        slot: 9,
        details: [
          "Transaction code debit cho charge.",
          "Được dùng khi charge được map sang classic accounting thay vì AA event type mặc định."
        ]
      },
      {
        name: "LOAN.REPAY",
        slot: 14,
        details: [
          "Transaction code repayment của loan trong classic AZ.",
          "Là mã post repayment chứ không phải rule tính tiền trả."
        ]
      },
      {
        name: "MATURITY.TXN",
        slot: 16,
        details: [
          "Transaction code dùng ở nghiệp vụ maturity.",
          "Giúp classic side biết phải hạch toán sự kiện đáo hạn bằng mã nào."
        ]
      },
      {
        name: "INT.SUS.TXN",
        slot: 18,
        details: [
          "Transaction code cho phần interest suspense hoặc suspended interest.",
          "Dùng khi lãi không được nhận ngay vào thu nhập thường."
        ]
      },
      {
        name: "MAX.BACK.DATE",
        slot: 28,
        details: [
          "Số ngày backdate tối đa cho classic AZ accounting.",
          "Là giới hạn vận hành cho posting lùi ngày."
        ]
      },
      {
        name: "ACCT.SYNC",
        slot: 29,
        details: [
          "Cờ đồng bộ account giữa AA và classic AZ.",
          "Record routine khóa field này là `NOCHANGE` trong product context."
        ]
      },
      {
        name: "INT.CORR.RTN",
        slot: 31,
        details: [
          "Routine correction interest sẽ được gọi khi cần sửa lãi.",
          "Field này không chứa amount mà chứa tên logic correction."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AZ.ACCOUNTING",
        routine: "AA.AZ.ACCOUNTING.RECORD.b",
        summary: "Property này trong source batch hiện chỉ có `FIELDS` và `RECORD`; chưa thấy action tài chính riêng. Tác động rõ nhất là khóa field `ACCT.SYNC` không cho đổi trong product context.",
        steps: [
          "Bước 1: `FIELDS` định nghĩa các transaction-code mapping cho debit, credit, capitalise, charge, payoff, maturity, suspense và correction.",
          "Bước 2: `RECORD` kiểm tra nếu đang ở product context thì đưa `ACCT.SYNC` vào `FIELD.LIST`.",
          "Bước 3: gọi `AA.ClassicProducts.SetClassicNochange(FIELD.LIST)` để set field này thành `NOCHANGE` trên màn hình record.",
          "Bước 4: source hiện chưa cho thấy routine action nào đọc hoặc cập nhật bảng business từ property class này."
        ],
        flow: [
          "Ảnh hưởng thực tế là khóa khả năng sửa cấu hình sync ở product level, chưa thấy write trực tiếp sang bảng nghiệp vụ."
        ]
      }
    ]
  },
  "az-cr-card": {
    name: "AZ.CR.CARD",
    slug: "az-cr-card",
    fields: [
      {
        name: "MULTI",
        slot: 3,
        details: [
          "Cờ cho phép cấu hình nhiều dòng hoặc nhiều instance cho classic credit card mapping.",
          "Record routine khóa field này ở product context."
        ]
      },
      {
        name: "CARD.TYPE",
        slot: 4,
        details: [
          "Loại thẻ được map sang classic.",
          "Source chỉ bật kiểm tra field này khi application `CQ` có cài trong company."
        ]
      },
      {
        name: "APPROPRIATE.TYPE",
        slot: 5,
        details: [
          "Loại appropriation hoặc phân nhóm xử lý thẻ.",
          "Là mã điều khiển behavior classic chứ không phải amount."
        ]
      },
      {
        name: "REVOLVING.RATIO",
        slot: 6,
        details: [
          "Tỷ lệ revolving được áp trên sản phẩm thẻ.",
          "Đây là ratio nghiệp vụ để chia phần dư nợ quay vòng."
        ]
      },
      {
        name: "AMT.PERCENT",
        slot: 8,
        details: [
          "Tỷ lệ phần trăm amount theo range hoặc product mapping của card.",
          "Field này đi cùng `HIGHEST.RANGE`."
        ]
      },
      {
        name: "CC.PR.GRACE.PERIOD",
        slot: 9,
        details: [
          "Số kỳ hoặc số ngày grace period cho phần principal card.",
          "Là cấu hình ân hạn, không phải due date phát sinh thực tế."
        ]
      },
      {
        name: "CREATE.PD.EOD",
        slot: 10,
        details: [
          "Cờ tạo payment due ở cuối ngày.",
          "Dùng để dời thời điểm tạo nghĩa vụ thanh toán sang EOD."
        ]
      },
      {
        name: "PD.LINK.MAIN.AZ",
        slot: 11,
        details: [
          "Cờ liên kết payment due về main AZ account.",
          "Record routine khóa field này ở product context."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AZ.CR.CARD",
        routine: "AA.AZ.CR.CARD.RECORD.b",
        summary: "Source hiện chỉ cho thấy `FIELDS` và `RECORD`. `RECORD` dùng để khóa các field nền của classic card mapping ở product level, chưa có action business riêng.",
        steps: [
          "Bước 1: `FIELDS` định nghĩa các field mapping thẻ như card type, revolving ratio, range, grace period và link tới main AZ.",
          "Bước 2: `RECORD` kiểm tra product context.",
          "Bước 3: nếu đúng product context thì đưa `MULTI` và `PD.LINK.MAIN.AZ` vào `FIELD.LIST`.",
          "Bước 4: gọi `AA.ClassicProducts.SetClassicNochange(FIELD.LIST)` để set các field đó thành `NOCHANGE`.",
          "Bước 5: không thấy source action nào tự select/update bảng business khác."
        ],
        flow: [
          "Tác động hiện thấy là khóa chỉnh sửa field cấu hình chứ chưa có posting hay write sang record nghiệp vụ."
        ]
      }
    ]
  },
  "az-deposit": {
    name: "AZ.DEPOSIT",
    slug: "az-deposit",
    fields: [
      {
        name: "MULTI",
        slot: 3,
        details: [
          "Cờ cho phép nhiều cấu hình classic deposit trên cùng property.",
          "Record routine khóa field này trong product context."
        ]
      },
      {
        name: "PART.REDEMPTION",
        slot: 5,
        details: [
          "Cờ cho phép redeem một phần tiền gửi.",
          "Đây là behavior nghiệp vụ của classic deposit arrangement."
        ]
      },
      {
        name: "ROLL.MAT.WRK.DAY",
        slot: 6,
        details: [
          "Cách xử lý ngày đáo hạn nếu rơi vào ngày nghỉ.",
          "Field này điều khiển rollover maturity theo working day."
        ]
      },
      {
        name: "CREATE.TD.FOR.INT",
        slot: 10,
        details: [
          "Cờ tạo time deposit riêng cho phần interest.",
          "Record routine khóa field này ở product context."
        ]
      },
      {
        name: "MATURITY.INSTR",
        slot: 12,
        details: [
          "Chỉ thị xử lý khi deposit đáo hạn.",
          "Khác với schedule vì đây là hướng dẫn nghiệp vụ ở classic side."
        ]
      },
      {
        name: "REPAYMENT.TYPE",
        slot: 18,
        details: [
          "Kiểu repayment của deposit product.",
          "Record routine khóa field này ở product context."
        ]
      },
      {
        name: "SINGLE.LIMIT",
        slot: 19,
        details: [
          "Cờ dùng một hạn mức đơn cho deposit mapping.",
          "Record routine cũng khóa field này ở product context."
        ]
      },
      {
        name: "PRE.CLOSURE.FEE",
        slot: 20,
        details: [
          "Mã fee hoặc rule fee dùng khi pre-close deposit.",
          "Field này cho biết deposit pre-closure có phát sinh phí nào."
        ]
      },
      {
        name: "RESCHED.TYPE",
        slot: 24,
        details: [
          "Kiểu reschedule áp cho deposit arrangement.",
          "Đi cùng `RESCHED.NOTICE` để xác định cơ chế báo trước."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AZ.DEPOSIT",
        routine: "AA.AZ.DEPOSIT.RECORD.b",
        summary: "Property này hiện mới thấy `FIELDS` và `RECORD`. `RECORD` chỉ khóa các field nền của classic deposit mapping, chưa có action riêng update bảng business.",
        steps: [
          "Bước 1: `FIELDS` định nghĩa các control classic deposit như partial redemption, maturity handling, create-TD-for-interest, repayment type, single limit và pre-closure fee.",
          "Bước 2: `RECORD` kiểm tra product context.",
          "Bước 3: nếu là product context thì đưa `MULTI`, `CREATE.TD.FOR.INT`, `SINGLE.LIMIT`, `REPAYMENT.TYPE` vào danh sách khóa.",
          "Bước 4: gọi `AA.ClassicProducts.SetClassicNochange(FIELD.LIST)` để set các field này thành `NOCHANGE`.",
          "Bước 5: không thấy action source nào tự read/write `AA.ACCOUNT.DETAILS`, `AA.BILL.DETAILS` hay bảng business khác cho property này."
        ],
        flow: [
          "Ảnh hưởng hiện có là khóa chỉnh sửa một số control classic cố định ở product level."
        ]
      }
    ]
  },
  "az-loan": {
    name: "AZ.LOAN",
    slug: "az-loan",
    fields: [
      {
        name: "DRAWDOWN.TYPE",
        slot: 3,
        details: [
          "Loại drawdown mà classic loan sẽ dùng.",
          "Là control nền của vòng đời giải ngân chứ không phải một activity cụ thể."
        ]
      },
      {
        name: "PD.LINK.TO.AZ",
        slot: 5,
        details: [
          "Cờ liên kết payment due về AZ classic.",
          "Record routine khóa field này ở product context."
        ]
      },
      {
        name: "IRA.PROCESS",
        slot: 6,
        details: [
          "Cờ hoặc chế độ xử lý IRA trên loan product.",
          "Record routine cũng khóa field này trong product context."
        ]
      },
      {
        name: "INT.ONLY",
        slot: 10,
        details: [
          "Cờ cho biết khoản vay có giai đoạn chỉ trả lãi hay không.",
          "Validate dùng field này để quyết định `MAX.INSTL.INT.ONLY` có bắt buộc hay không."
        ]
      },
      {
        name: "MAX.INSTL.INT.ONLY",
        slot: 11,
        details: [
          "Số kỳ tối đa được phép chỉ trả lãi.",
          "Nếu `INT.ONLY = Y` thì field này bắt buộc; giá trị có thể là số thuần hoặc bắt đầu bằng `P` rồi theo sau là số."
        ]
      },
      {
        name: "REPAYMENT.TYPE",
        slot: 14,
        details: [
          "Kiểu repayment của loan product.",
          "Record routine khóa field này trong product context."
        ]
      },
      {
        name: "SINGLE.LIMIT",
        slot: 15,
        details: [
          "Cờ dùng một hạn mức đơn cho classic loan mapping.",
          "Record routine khóa field này trong product context."
        ]
      },
      {
        name: "TERM.PRIORITY",
        slot: 16,
        details: [
          "Ưu tiên term khi có nhiều yếu tố term cùng tác động lên loan.",
          "Field này là rule ưu tiên chứ không phải amount."
        ]
      },
      {
        name: "PRE.CLOSURE.FEE",
        slot: 18,
        details: [
          "Mã hoặc rule phí pre-closure của loan.",
          "Field này quyết định có fee khi tất toán sớm hay không."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AZ.LOAN",
        routine: "AA.AZ.LOAN.RECORD.b / AA.AZ.LOAN.VALIDATE.b",
        summary: "Source hiện chưa có action business riêng; phần có logic thật nằm ở `RECORD` để khóa field nền và `VALIDATE` để ép ràng buộc cho chế độ chỉ trả lãi.",
        steps: [
          "Bước 1: `FIELDS` định nghĩa các control loan như drawdown, maturity instruction, interest-only, repayment type, single limit và reschedule.",
          "Bước 2: `RECORD` kiểm tra product context, rồi đưa `PD.LINK.TO.AZ`, `IRA.PROCESS`, `SINGLE.LIMIT`, `REPAYMENT.TYPE` vào `FIELD.LIST` và gọi `AA.ClassicProducts.SetClassicNochange(...)`.",
          "Bước 3: `VALIDATE` đọc `INT.ONLY` và `MAX.INSTL.INT.ONLY` từ record nhập mới.",
          "Bước 4: nếu `INT.ONLY = Y` mà `MAX.INSTL.INT.ONLY` trống thì gắn lỗi `AZ.RTN.MAND.INT.ONLY.PAYMENTS.1` vào field.",
          "Bước 5: nếu có nhập `MAX.INSTL.INT.ONLY`, validate tiếp phần giá trị phía sau phải là số, kể cả trường hợp dùng tiền tố `P`."
        ],
        flow: [
          "Không thấy source cập nhật trực tiếp bảng business; logic hiện có tập trung ở khóa field và validate dữ liệu đầu vào."
        ]
      }
    ]
  },
  "az-savings": {
    name: "AZ.SAVINGS",
    slug: "az-savings",
    fields: [
      {
        name: "CREDIT.AMT.MULTI",
        slot: 3,
        details: [
          "Cờ cho phép nhiều dòng amount credit trong classic savings mapping.",
          "Source chỉ định field kiểu `YES/blank`, nên đây là công tắc cấu hình."
        ]
      },
      {
        name: "BONUS.PREMIUM",
        slot: 4,
        details: [
          "Mã bonus hoặc premium gắn với savings product.",
          "Là text/mã cấu hình chứ không phải amount thực tế."
        ]
      },
      {
        name: "LATE.PYMT.FEE",
        slot: 5,
        details: [
          "Charge hoặc commission áp cho trả chậm.",
          "Source khai báo field kiểu `CHG/CHG/COM`, cho thấy nó tham chiếu mã charge hoặc commission."
        ]
      },
      {
        name: "LIAB.TO.PENALTY",
        slot: 6,
        details: [
          "Cờ xác định savings có phải chịu penalty hay không.",
          "Là điều kiện bật/tắt phần phạt."
        ]
      },
      {
        name: "PENALTY.COLL.AT",
        slot: 7,
        details: [
          "Thời điểm thu penalty, như ngay lập tức, kỳ tiếp theo, kỳ lãi tới hoặc maturity.",
          "Field này quyết định lúc nào hệ thống được phép thu phần phạt."
        ]
      },
      {
        name: "BONUS.ON",
        slot: 8,
        details: [
          "Xác định bonus tính trên principal hay interest.",
          "Source chỉ cho hai giá trị `PRINCIPAL` hoặc `INTEREST`."
        ]
      },
      {
        name: "BONUS.ON.ARREARS",
        slot: 9,
        details: [
          "Cờ cho phép vẫn tính bonus trên khoản đang arrears.",
          "Đây là rule bonus, không phải trạng thái overdue."
        ]
      }
    ],
    actions: [
      {
        name: "NO DIRECT ACTION AZ.SAVINGS",
        routine: "AA.AZ.SAVINGS.FIELDS.b",
        summary: "Trong source batch hiện chỉ thấy `FIELDS` cho `AZ.SAVINGS`; chưa thấy `RECORD`, `VALIDATE` hay action routine riêng để mô tả read/write bảng business.",
        steps: [
          "Bước 1: `FIELDS` định nghĩa các control bonus, penalty, late-payment fee và multi-credit amount cho classic savings.",
          "Bước 2: một số field reserved được đặt sẵn `NOINPUT`, cho thấy source chừa chỗ nhưng không cho nhập trực tiếp.",
          "Bước 3: chưa thấy routine action nào tự select hay update file business từ property class này trong batch source đã đọc."
        ],
        flow: [
          "Hiện mới xác nhận được semantics của field; chưa có bằng chứng source cho action riêng."
        ]
      }
    ]
  }
};
