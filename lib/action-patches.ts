import type { PropertyAction, PropertyClass } from "@/lib/property-data";

type ActionPatch = {
  overview?: string;
  actions?: PropertyAction[];
};

export const actionPatches: Record<string, ActionPatch> = {
  charge: {
    actions: [
      {
        name: "ISSUE.BILL CHARGE",
        routine: "AA.CHARGE.ISSUE.BILL.b",
        summary: "Tạo bill khi một khoản phí phát sinh: ghi nhận số tiền, ngày đến hạn, phương thức xử lý và lên lịch activity MAKE.DUE tương ứng.",
        steps: [
          "Bước 1: Đọc thông tin chi tiết khoản phí đã được tính toán (số tiền, tiền tệ, ngày phát sinh).",
          "Bước 2: Xác định phương thức xử lý phí: DUE (yêu cầu khách trả riêng), PAY (ngân hàng chi trả ra ngoài), hoặc CAPITALISE (cộng vào gốc khoản vay).",
          "Bước 3: Tính ngày đến hạn — nếu có tần suất billing thì tính theo tần suất, nếu không thì đến hạn ngay.",
          "Bước 4: Tạo bản ghi bill với đầy đủ thông tin phí, loại phí (định kỳ, phí activity, phí commission) và thêm thuế nếu có.",
          "Bước 5: Cập nhật lịch thanh toán và đăng ký activity MAKE.DUE vào đúng ngày đến hạn.",
          "Bước 6: Nếu arrangement có participant, tạo bill riêng cho từng bên; nếu khoản vay đã charge-off, tạo thêm bill theo dõi phần CO riêng biệt."
        ],
        flow: [
          "Ghi mới AA.BILL.DETAILS với thông tin phí.",
          "Cập nhật AA.SCHEDULED.ACTIVITY cho MAKE.DUE.",
          "Cập nhật charge details với tham chiếu bill mới tạo."
        ]
      },
      {
        name: "MAKE.DUE CHARGE",
        routine: "AA.CHARGE.MAKE.DUE.b / AA.PROCESS.CHARGE.MAKE.DUE.b",
        summary: "Kích hoạt nghĩa vụ thanh toán phí: chuyển khoản phí từ trạng thái chờ sang đến hạn, dựng bút toán kế toán DUE và cập nhật trạng thái bill.",
        steps: [
          "Bước 1: Lấy danh sách bill phí đến hạn trong ngày hiệu lực, bao gồm cả bill deferred (phí bị hoãn từ kỳ trước).",
          "Bước 2: Với từng bill, xác định số tiền đến hạn thực tế sau khi trừ phần đã được waive (miễn giảm) và phần đang bị suspend (tạm hoãn).",
          "Bước 3: Xác định cách ghi nhận kế toán dựa trên phương thức của phí: phí thông thường chuyển sang balance DUE; phí có accrual/amortisation thì xử lý kỳ tích luỹ trước; phí deferred dùng balance riêng.",
          "Bước 4: Dựng bút toán kế toán — chiều ghi nợ DUE balance (hoặc DUE.SP nếu arrangement đang suspended), chiều ghi có giảm balance tích luỹ hoặc current.",
          "Bước 5: Nếu khoản phí đã được điều chỉnh về 0 (adjusted to zero), cập nhật bill sang trạng thái SETTLED/REPAID thay vì chờ thu.",
          "Bước 6: Nếu arrangement bị charge-off, xử lý riêng ba lớp: phần ngân hàng (BANK), phần khách hàng (CUST) và phần đã charge-off (CO)."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS để lấy số tiền và trạng thái bill.",
          "Có thể ghi lại AA.BILL.DETAILS khi bill bị adjust về 0.",
          "Ghi bút toán kế toán qua accounting manager."
        ]
      },
      {
        name: "ACCRUE CHARGE",
        routine: "AA.CHARGE.ACCRUE.b",
        summary: "Phân bổ doanh thu/chi phí phí theo kỳ kế toán (accrual/amortisation): đảm bảo P&L được ghi nhận dần đều thay vì dồn một lần khi phí đến hạn.",
        steps: [
          "Bước 1: Xác định các kỳ accrual/amortisation đang hoạt động của khoản phí trong arrangement.",
          "Bước 2: Nếu đây là lần thanh toán cuối (apply payment đóng hợp đồng) và tất cả khoản due đã được settle, đóng sớm kỳ amortisation tại ngày thanh toán thay vì chờ đến cuối kỳ.",
          "Bước 3: Với từng kỳ accrual chưa xử lý, kiểm tra ngày accrue còn nhỏ hơn ngày hiệu lực mới tính — tránh ghi trùng cho cùng một kỳ.",
          "Bước 4: Chạy engine accrual để tính số tiền P&L cần ghi nhận trong kỳ này và post bút toán chuyển từ balance dự phòng (deferred) sang thu nhập/chi phí.",
          "Bước 5: Cập nhật bản ghi accrual đánh dấu kỳ đã xử lý."
        ],
        flow: [
          "Đọc EB.ACCRUAL records của khoản phí.",
          "Cập nhật EB.ACCRUAL đánh dấu kỳ đã accrue.",
          "Ghi bút toán phân bổ P&L qua engine accrual."
        ]
      },
      {
        name: "CAPITALISE CHARGE",
        routine: "AA.CHARGE.CAPITALISE.b",
        summary: "Cộng khoản phí vào dư nợ gốc thay vì thu tiền ngay: phí được chuyển từ balance DUE/accrual sang principal của khoản vay, làm tăng số tiền khách hàng còn nợ.",
        steps: [
          "Bước 1: Lấy danh sách bill phí được đánh dấu CAPITALISE (hoặc bill DUE có phương thức CAP.AND.INV — vừa cộng gốc vừa lập hoá đơn).",
          "Bước 2: Với từng bill, xác định số tiền capitalise thực tế sau khi trừ phần waive; nếu capitalise kèm hoá đơn (CAP.AND.INV) thì tách riêng phần gốc và phần invoice.",
          "Bước 3: Nếu phí đang tích luỹ (accrual), xử lý đóng kỳ accrual trước khi cộng vào gốc; điều chỉnh số tiền nếu cần so với kỳ accrual hiện tại.",
          "Bước 4: Dựng bút toán kế toán chuyển phí sang balance principal (CUR của ACCOUNT) — giảm balance DUE/ACC của phí, tăng dư nợ gốc.",
          "Bước 5: Nếu arrangement đang trong quy trình tất toán sớm (payoff), cộng phần capitalise vào báo giá payoff.",
          "Bước 6: Nếu khoản vay bị charge-off, xử lý lần lượt ba lớp BANK, CUST, CO với balance type tương ứng."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS và AA.CHARGE.DETAILS.",
          "Cập nhật payoff bill nếu đang trong flow tất toán sớm.",
          "Ghi bút toán kế toán capitalise qua accounting manager."
        ]
      },
      {
        name: "REPAY CHARGE",
        routine: "AA.CHARGE.REPAY.b",
        summary: "Ghi nhận việc khách hàng thanh toán khoản phí đã đến hạn: giảm balance DUE của phí và cập nhật trạng thái bill sang đã trả.",
        steps: [
          "Bước 1: Xác định những bill phí nào đã được thanh toán trong activity hiện tại (tra theo repayment reference).",
          "Bước 2: Với từng bill, xác định số tiền được trả và trạng thái aging của bill (current, overdue, charge-off) để biết cần knock off balance nào.",
          "Bước 3: Nếu phí được trả bao gồm cả phần đang bị suspend, xử lý giải phóng phần suspend tương ứng.",
          "Bước 4: Dựng bút toán kế toán: giảm balance DUE (hoặc aging balance tương ứng), ghi có vào tài khoản suspense thu tiền.",
          "Bước 5: Nếu phí có phần chưa amortise hết (unamortised charge) tại thời điểm trả sớm, dựng thêm bút toán ghi nhận nhanh phần còn lại.",
          "Bước 6: Nếu arrangement bị charge-off, xử lý thêm bút toán knock off phần CO trên sổ P&L charge-off."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS theo repayment reference.",
          "Đọc AA.ACTIVITY.BALANCES để xử lý phần unamortised charge.",
          "Ghi bút toán kế toán thu phí qua accounting manager."
        ]
      },
      {
        name: "PAY CHARGE",
        routine: "AA.CHARGE.PAY.b",
        summary: "Hạch toán chi trả phí ra ngoài trong sản phẩm tiền gửi/tiết kiệm: khi ngân hàng trả phí (ví dụ phí dịch vụ trả cho bên thứ ba), giảm balance phí và ghi nhận nghĩa vụ chi trả.",
        steps: [
          "Bước 1: Lấy danh sách bill phí đã được xử lý trong activity payout hiện tại.",
          "Bước 2: Lọc lấy những bill có phương thức PAY (chi trả ra ngoài), loại bỏ những bill loại DUE.",
          "Bước 3: Xác định số tiền phí cần chi trả; nếu phí có thành phần thuế, tính số tiền thuế tổng hợp tương ứng.",
          "Bước 4: Xác định balance type thực tế cần giảm (current, overdue theo trạng thái bill).",
          "Bước 5: Dựng bút toán kế toán: ghi nợ balance phí (giảm nghĩa vụ), ghi có vào tài khoản suspense thanh toán ra ngoài.",
          "Bước 6: Đẩy bút toán vào hệ thống kế toán."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS để lấy bill PAY của phí.",
          "Không ghi bill trực tiếp trong routine này.",
          "Ghi bút toán kế toán qua accounting manager."
        ]
      },
      {
        name: "UPDATE CHARGE",
        routine: "AA.CHARGE.UPDATE.b",
        summary: "Cập nhật điều kiện phí khi có thay đổi (số tiền, rate, waive, suppress): tính lại lịch amortisation và lên lịch hết hạn điều chỉnh nếu cần.",
        steps: [
          "Bước 1: So sánh điều kiện phí cũ và mới để phát hiện thay đổi.",
          "Bước 2: Nếu số tiền phí thay đổi và phí đang trong giai đoạn amortisation, tính lại lịch amortisation còn lại.",
          "Bước 3: Nếu cờ tham chiếu hạn mức (REFER.LIMIT) thay đổi, kích hoạt activity phụ để rà soát lại tài khoản.",
          "Bước 4: Nếu điều chỉnh phí có ngày hết hạn (ví dụ: miễn phí 3 tháng đầu), lên lịch activity EXPIRE.ADJUSTMENT để hệ thống tự hoàn nguyên về mức phí ban đầu.",
          "Bước 5: Cập nhật cờ suppress nếu phí đang được tạm dừng hoặc khôi phục.",
          "Bước 6: Ghi nhận thay đổi condition để theo dõi lịch sử."
        ],
        flow: [
          "Cập nhật AA.SCHEDULED.ACTIVITY cho EXPIRE.ADJUSTMENT nếu có ngày hết hạn.",
          "Cập nhật lịch accrual/amortisation nếu số tiền phí thay đổi.",
          "Ghi nhận change condition."
        ]
      }
    ]
  },

  account: {
    actions: [
      {
        name: "UPDATE ACCOUNT",
        routine: "AA.ACCOUNT.UPDATE.b",
        summary: "Cập nhật thông tin tài khoản ngân hàng của arrangement: tính lại ngày chu kỳ, sinh mã nhận diện phụ (alternate ID / IBAN) và đồng bộ thông tin account details.",
        steps: [
          "Bước 1: Hệ thống xác định ngày anniversary (chu kỳ) của tài khoản dựa trên BASE.DATE.TYPE và ngày hiệu lực của arrangement.",
          "Bước 2: Nếu arrangement chưa liên kết tài khoản ngân hàng, hệ thống tạo liên kết giữa arrangement ID và số tài khoản.",
          "Bước 3: Nếu cấu hình sinh mã alternate ID, hệ thống gọi dịch vụ sinh mã và ghi lại ALT.ID.TYPE cùng ALT.ID vào record.",
          "Bước 4: Nếu bật tính năng IBAN, hệ thống sinh số IBAN và cập nhật vào các trường tương ứng.",
          "Bước 5: Với arrangement mới, hệ thống cập nhật AA.ACCOUNT.DETAILS để phản ánh trạng thái ban đầu của tài khoản.",
          "Bước 6: Nếu tài khoản cần liên kết với limit arrangement, hệ thống đồng bộ link limit và tạo/cập nhật ACCOUNT.DEBIT.LIMIT."
        ],
        flow: [
          "Ghi ngày anniversary, alternate ID và IBAN trực tiếp vào record mới.",
          "Cập nhật liên kết tài khoản trong arrangement.",
          "Cập nhật AA.ACCOUNT.DETAILS khi arrangement mới được tạo.",
          "Tạo hoặc cập nhật ACCOUNT.DEBIT.LIMIT khi có cấu hình limit."
        ]
      },
      {
        name: "PAY ACCOUNT",
        routine: "AA.ACCOUNT.PAY.b",
        summary: "Hạch toán payment cho phần principal dựa trên bill đã được chọn sẵn từ hoạt động payout hoặc disbursement.",
        steps: [
          "Bước 1: Hệ thống xác định ngày thanh toán và đơn vị tiền tệ của arrangement.",
          "Bước 2: Duyệt danh sách bill cần xử lý, xác định trạng thái từng bill (current, uncleared, available).",
          "Bước 3: Lấy số tiền principal phải xử lý cho từng bill theo loại payment (PAY).",
          "Bước 4: Xác định balance type thực tế cần tác động (CUR, UNC, AVL hoặc balance charged-off tương ứng).",
          "Bước 5: Dựng bút toán kế toán với số tiền, chiều, balance type, ngày giá trị và tài khoản đối ứng.",
          "Bước 6: Đẩy bút toán vào hệ thống kế toán để ghi nhận payment."
        ],
        flow: [
          "Đọc thông tin bill từ AA.BILL.DETAILS.",
          "Không ghi bill trực tiếp trong routine này.",
          "Ghi bút toán kế toán qua accounting manager."
        ]
      },
      {
        name: "MAKE.DUE ACCOUNT",
        routine: "AA.ACCOUNT.MAKE.DUE.b",
        summary: "Chuyển principal từ trạng thái current sang due (đến hạn) theo lịch thanh toán, phản ánh khoản nợ gốc khách hàng phải trả trong kỳ.",
        steps: [
          "Bước 1: Xác định trạng thái charge-off của arrangement; nếu đã charge-off thì xử lý riêng cho từng subtype (BANK và CUST).",
          "Bước 2: Lấy bill của ngày make due hiện tại theo lịch thanh toán.",
          "Bước 3: Xác định loại bill (DUE, PAY, EXPECTED, disbursement) và amount principal đến hạn cho từng bill.",
          "Bước 4: Căn cứ loại bill để chọn cặp balance kế toán: bill DUE thì ghi nợ DUE / giảm CUR; bill PAY thì ghi nợ CUR / giảm PAY; bill EXPECTED đi balance EXP.",
          "Bước 5: Dựng bút toán kế toán và đẩy vào hệ thống kế toán.",
          "Bước 6: Nếu là kỳ thanh toán cuối cùng, kích hoạt thêm secondary activity để xử lý phần dư còn lại."
        ],
        flow: [
          "Đọc thông tin bill từ AA.BILL.DETAILS.",
          "Ghi bút toán kế toán qua accounting manager.",
          "Có thể thêm secondary activity cuối kỳ."
        ]
      },
      {
        name: "REPAY ACCOUNT",
        routine: "AA.ACCOUNT.REPAY.b",
        summary: "Thu hồi nợ gốc thực sự từ khách hàng theo activity repayment hiện tại, giảm số dư principal tương ứng trên arrangement.",
        steps: [
          "Bước 1: Xác định trạng thái charge-off; nếu đã charge-off thì xử lý theo từng subtype (CUST, BANK, CO).",
          "Bước 2: Tìm bill đã được gắn với activity repayment này thông qua repayment reference.",
          "Bước 3: Đọc thông tin bill: trạng thái bill, trạng thái settle, trạng thái aging để xác định loại balance cần knock-off.",
          "Bước 4: Xác định số tiền principal cần thu hồi và balance type thực tế (DUE, aging hoặc charged-off).",
          "Bước 5: Kiểm tra thêm activity balances để xử lý phần current hoặc uncleared đã được settle trong cùng activity.",
          "Bước 6: Dựng bút toán kế toán với số tiền, chiều credit/debit và tài khoản đối ứng (suspense hoặc charged-off target), rồi đẩy vào hệ thống kế toán."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS theo repayment reference.",
          "Đọc AA.ACTIVITY.BALANCES để xử lý phần current/uncleared đã settle.",
          "Ghi bút toán kế toán qua accounting manager."
        ]
      }
    ]
  },

  accounting: {
    actions: [
      {
        name: "MANAGER ACCOUNTING",
        routine: "AA.ACCOUNTING.MANAGER.b",
        summary: "Routine trung tâm của lớp kế toán AA: nhận danh sách sự kiện kế toán từ các action khác, làm giàu thông tin, ánh xạ sang allocation rule và lưu trữ bút toán vào hệ thống.",
        steps: [
          "Bước 1: Kiểm tra các thông tin bắt buộc (loại xử lý, property, action, ngày); lấy mặc định từ context activity nếu thiếu.",
          "Bước 2: Với property INTEREST, kiểm tra cờ MEMO.ONLY; trong batch zero-auth có thể chuyển sang chế độ SAO (soft accounting only).",
          "Bước 3: Duyệt từng sự kiện kế toán trong danh sách: kiểm tra số tiền và chiều bắt buộc, bổ sung tỷ giá và số tiền quy đổi nội tệ nếu cần.",
          "Bước 4: Lấy cấu hình accounting của property (allocation rule, contra target, booking category, transaction code) và gán vào từng sự kiện.",
          "Bước 5: Tổng hợp danh sách sự kiện và chuyển sang soft accounting để hoàn tất ánh xạ balance type, posting rule và tài khoản thực.",
          "Bước 6: Lưu trữ bút toán cuối cùng vào hệ thống kế toán."
        ],
        flow: [
          "Đọc cấu hình accounting từ property setup và context activity.",
          "Tính tỷ giá / số tiền nội tệ nếu sự kiện chưa có.",
          "Lưu bút toán sau khi qua soft accounting."
        ]
      },
      {
        name: "ACTION.DETAILS ACCOUNTING",
        routine: "AA.ACCOUNTING.ACTION.DETAILS.b",
        summary: "Cung cấp metadata kế toán (balance prefix, chiều giao dịch, subtype) cho từng cặp activity/action trong AA — dùng như bảng tra cứu nội bộ.",
        steps: [
          "Bước 1: Nhận thông tin activity, property class, property, overdue status và action cần tra.",
          "Bước 2: Tra bảng ánh xạ cố định và trả về: balance prefix, chiều (debit/credit), subtype tương ứng.",
          "Bước 3: Lớp kế toán dùng kết quả để xác định loại sự kiện nào phải dựng cho activity/action đang chạy."
        ],
        flow: [
          "Routine tra mapping, không tự ghi bút toán."
        ]
      },
      {
        name: "ACTIVITY.ALLOCATE ACCOUNTING",
        routine: "AA.ACCOUNTING.ACTIVITY.ALLOCATE.b",
        summary: "Nhận bút toán từ ứng dụng bên ngoài và ánh xạ về activity AA tương ứng để xử lý net movement.",
        steps: [
          "Bước 1: Nhận account ID, bản ghi tài khoản và bút toán đến từ bên ngoài.",
          "Bước 2: Xác định activity AA tương ứng cần xử lý movement đó.",
          "Bước 3: Tổng hợp movement theo arrangement và activity, kích hoạt activity AA phù hợp."
        ],
        flow: [
          "Cầu nối giữa bút toán bên ngoài và activity AA."
        ]
      },
      {
        name: "DISTRIBUTE ACCOUNTING",
        routine: "AA.ACCOUNTING.DISTRIBUTE.b",
        summary: "Phân phối bút toán vào tài khoản suspense hoặc tài khoản AA thực — quyết định đường đi cuối của từng entry.",
        steps: [
          "Bước 1: Nhận account ID, bản ghi tài khoản, bút toán và loại bút toán.",
          "Bước 2: Xác định bút toán thuộc flow AA nào.",
          "Bước 3: Đổi target sang tài khoản suspense hoặc tài khoản AA thực rồi trả lại danh sách bút toán mới."
        ],
        flow: [
          "Routine phân phối tài khoản đích cho bút toán."
        ]
      },
      {
        name: "POST.PROCESS ACCOUNTING",
        routine: "AA.ACCOUNTING.POST.PROCESS.b",
        summary: "Hậu xử lý danh sách bút toán sau pre-processing của AA để đảm bảo context đúng khi có các lời gọi kế toán lồng nhau.",
        steps: [
          "Bước 1: Nhận loại lời gọi kế toán và mảng bút toán đã được AA bổ sung thông tin.",
          "Bước 2: Điều chỉnh hoặc giữ nguyên context chung cho các lời gọi lồng nhau.",
          "Bước 3: Đảm bảo AA.ITEM.REF và metadata activity vẫn chính xác trước khi core accounting xử lý tiếp."
        ],
        flow: [
          "Routine hậu xử lý, không phải nơi xây dựng rule kế toán từ đầu."
        ]
      },
      {
        name: "UPDATE ACCOUNTING",
        routine: "AA.ACCOUNTING.UPDATE.b",
        summary: "Ghi nhận thay đổi cấu hình kế toán của arrangement khi booking category, allocation rule hoặc amortisation setup thay đổi.",
        steps: [
          "Bước 1: Lấy context activity hiện tại.",
          "Bước 2: Ghi nhận thay đổi condition cho property accounting.",
          "Bước 3: Xử lý lỗi và ghi log."
        ],
        flow: [
          "Routine cập nhật condition, không xử lý bút toán kế toán."
        ]
      }
    ]
  },

  "activity-mapping": {
    actions: [
      {
        name: "UPDATE ACTIVITY.MAPPING",
        routine: "AA.ACTIVITY.MAPPING.UPDATE.b",
        summary: "Cập nhật bảng ánh xạ giữa transaction code (hoặc event) T24 và activity AA, đảm bảo mỗi giao dịch đến được định tuyến đúng luồng xử lý.",
        steps: [
          "Bước 1: Hệ thống đọc trạng thái activity, ngày hiệu lực, arrangement ID và property ID hiện tại.",
          "Bước 2: Ở các bước input/delete/reverse, hệ thống ghi nhận thay đổi cấu hình mapping.",
          "Bước 3: Phần validate kiểm tra toàn bộ danh sách TXN.ACTIVITY: mỗi activity phải được phép dùng cho property class ACTIVITY.MAPPING và không được khai trùng transaction code.",
          "Bước 4: Ở cấp arrangement (không phải product template), nếu sản phẩm có property FACILITY thì DEF.EVENT.ACTIVITY là bắt buộc.",
          "Bước 5: Sau khi validate thành công, thay đổi mapping được chốt vào condition."
        ],
        flow: [
          "Validate tính hợp lệ của từng dòng TXN.ACTIVITY và EVENT.ACTIVITY.",
          "Ghi nhận thay đổi mapping qua change-condition processing."
        ]
      }
    ]
  },

  customer: {
    actions: [
      {
        name: "UPDATE CUSTOMER",
        routine: "AA.CUSTOMER.UPDATE.b",
        summary: "Cập nhật danh sách chủ sở hữu và vai trò trong arrangement, đồng bộ danh mục arrangement theo khách hàng, kích hoạt kiểm tra dormancy và cascade thay đổi xuống các drawing khi cần.",
        steps: [
          "Bước 1: Hệ thống đọc thông tin arrangement hiện tại: owner cũ, vai trò, tiền tệ và product group.",
          "Bước 2: Với activity CHANGE-CUSTOMER ở bước input: cập nhật owner mới (CUSTOMER.ID, CUSTOMER.ROLE) lên bản ghi arrangement với ngày hiệu lực tương ứng.",
          "Bước 3: Đồng bộ file danh mục AA.CUSTOMER.ARRANGEMENT — thêm arrangement vào danh sách của customer mới và xóa khỏi danh sách customer cũ.",
          "Bước 4: Khi duyệt (authorize): kích hoạt kiểm tra dormancy cho customer mới (chuyển sang ACTIVE) và customer cũ (CHECK); nếu reverse thì hoàn nguyên cả hai.",
          "Bước 5: Nếu arrangement thuộc product line FACILITY, cascade thay đổi customer/role xuống tất cả drawing bên dưới.",
          "Bước 6: Khi duyệt hoặc reverse, cập nhật thông tin CRA (Credit Risk Assessment) theo customer condition hiện tại."
        ],
        flow: [
          "Cập nhật AA.ARRANGEMENT với owner/role mới.",
          "Cập nhật AA.CUSTOMER.ARRANGEMENT và lịch sử.",
          "Kích hoạt kiểm tra dormancy cho customer mới và cũ."
        ]
      },
      {
        name: "PROCESS CUSTOMER",
        routine: "AA.CUSTOMER.PROCESS.b",
        summary: "Ghi thông tin owner/role vào bản ghi arrangement simulation — dùng khi tính toán thử (simulation) thay vì áp dụng trực tiếp lên arrangement live.",
        steps: [
          "Bước 1: Đánh dấu chế độ simulation đang hoạt động.",
          "Bước 2: Lấy CUSTOMER.ID và CUSTOMER.ROLE từ bản ghi input; nếu đang reversal thì lấy từ bản ghi property trước đó.",
          "Bước 3: Xây dựng arrangement ID mở rộng với flag simulation.",
          "Bước 4: Ghi owner/role vào bản ghi arrangement simulation với ngày hiệu lực của activity."
        ],
        flow: [
          "Không chạm vào AA.ARRANGEMENT live.",
          "Ghi vào bản ghi simulation của arrangement."
        ]
      },
      {
        name: "DATACAPTURE CUSTOMER",
        routine: "AA.CUSTOMER.DATACAPTURE.b",
        summary: "Tự động điền ghi chú khách hàng (NOTES) từ narrative của activity — thường dùng trong framework data capture và kiểm thử.",
        steps: [
          "Bước 1: Đọc bản ghi activity hiện tại.",
          "Bước 2: Lấy narrative của activity và thêm hậu tố '-External'.",
          "Bước 3: Ghi giá trị đó vào trường AA.CUS.NOTES trong bản ghi input."
        ],
        flow: [
          "Không ghi file nghiệp vụ trực tiếp.",
          "Chỉ điền trường NOTES trong pipeline data-capture."
        ]
      }
    ]
  },

  "payment-rules": {
    actions: [
      {
        name: "ALLOCATE PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.ALLOCATE.b",
        summary: "Phân bổ số tiền repayment vào bill và property theo hierarchy ưu tiên được cấu hình, cập nhật payment amount trên bill và tạo activity xử lý phần tiền dư nếu có.",
        steps: [
          "Bước 1: Xác định quy tắc phân bổ tài chính đang hiệu lực dựa trên trạng thái tài chính của arrangement (PERFORMING / SUSPENDED / RESTRUCTURE).",
          "Bước 2: Nếu là advance payment, kiểm tra xem còn bill DUE hoặc aging chưa settle hay không — nếu còn thì cảnh báo override.",
          "Bước 3: Phân bổ số tiền vào từng bill và property theo thứ tự ưu tiên: xác định bill nào nhận bao nhiêu, property nào được trả, số tiền dư còn lại.",
          "Bước 4: Cập nhật payment amount trên từng bill đã được phân bổ.",
          "Bước 5: Nếu còn tiền dư sau khi phân bổ hết, tạo secondary activity để xử lý phần dư theo cấu hình REMAINDER.ACTIVITY.",
          "Bước 6: Với khoản vay kỹ thuật (technical loan), tạo thêm secondary activity repay trên khoản vay gốc tương ứng."
        ],
        flow: [
          "Đọc quy tắc tài chính và danh sách bill hiện hành.",
          "Cập nhật AA.BILL.DETAILS qua bill payment amount manager.",
          "Có thể tạo secondary activity xử lý phần dư."
        ]
      },
      {
        name: "CREATE.DUE PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.CREATE.DUE.b",
        summary: "Tạo secondary make-due activity cho các bill ISSUED khi quy tắc yêu cầu chuyển bill đã phát hành sang trạng thái đến hạn.",
        steps: [
          "Bước 1: Chỉ tiếp tục nếu cấu hình MAKE.BILL.DUE = YES trên quy tắc hiệu lực.",
          "Bước 2: Lấy danh sách tất cả bill ISSUED của arrangement.",
          "Bước 3: Với từng bill, xác định ngày thanh toán, phương thức và loại bill.",
          "Bước 4: Nếu bill là loại charge phát sinh theo activity (PR.CHARGE hoặc ACT.CHARGE), chỉ tạo một make-due activity cho mỗi property.",
          "Bước 5: Đăng ký secondary activity make-due để hệ thống xử lý bill chuyển sang due ở bước tiếp theo."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS của các bill ISSUED.",
          "Tạo secondary activity list thay vì ghi trực tiếp bill."
        ]
      },
      {
        name: "PRE.BILL PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.PRE.BILL.b",
        summary: "Tạo activity phụ trước khi bill phát sinh — dùng khi quy tắc phân bổ theo bill nhưng arrangement chưa có bill nào.",
        steps: [
          "Bước 1: Đọc quy tắc hiệu lực và kiểm tra APPLICATION.TYPE có phải loại dựa theo bill hay không (BILL.PROPERTY hoặc BILL.DATE).",
          "Bước 2: Kiểm tra arrangement hiện đã có bill nào chưa.",
          "Bước 3: Nếu chưa có bill và PRE.BILL.ACTIVITY được cấu hình, tạo bản ghi activity mới.",
          "Bước 4: Gắn thông tin arrangement, activity và ngày hiệu lực cho activity mới rồi đăng ký vào secondary activity list."
        ],
        flow: [
          "Không ghi bill trực tiếp.",
          "Tạo secondary activity để luồng tiếp theo xử lý phần pre-bill."
        ]
      }
    ]
  },

  "payment-schedule": {
    actions: [
      {
        name: "UPDATE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.UPDATE.b",
        summary: "Ghi nhận thay đổi cấu hình lịch thanh toán — phần xây dựng lịch thực tế và tạo bill được xử lý trong schedule manager.",
        steps: [
          "Bước 1: Lấy context activity và xác định chế độ xử lý (cập nhật, xóa hoặc duyệt).",
          "Bước 2: Chuyển cho schedule manager xử lý việc xây dựng lịch thanh toán.",
          "Bước 3: Ghi nhận thay đổi condition để theo dõi lịch sử cấu hình.",
          "Bước 4: Phần xây dựng bill chi tiết và AA.SCHEDULED.ACTIVITY không nằm trong routine wrapper này."
        ],
        flow: [
          "Không ghi bill trực tiếp.",
          "Điểm xử lý thực tế được đẩy vào PaymentScheduleManager."
        ]
      },
      {
        name: "MAKE.DUE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.MAKE.DUE.b",
        summary: "Cập nhật bill đến hạn trong kỳ: tính lại số tiền due, cập nhật trạng thái bill, xử lý lãi/phí accrual theo bill và cập nhật lịch kỳ tiếp theo.",
        steps: [
          "Bước 1: Xác định ngày thanh toán cuối và đảm bảo bill đến hạn đã sẵn sàng (tính lại nếu cần, phát hành nếu chưa có).",
          "Bước 2: Lấy danh sách bill cần xử lý và đọc thông tin chi tiết từng bill.",
          "Bước 3: Xác định số tiền due của từng property trên bill, cùng ngày thanh toán thực tế.",
          "Bước 4: Cập nhật số tiền property, thuế và các điều chỉnh lên bill; cập nhật trạng thái bill, chi tiết thanh toán và trạng thái settle.",
          "Bước 5: Nếu bill có lãi theo kỳ (bill-wise interest), tạo accrual kỳ cho bill đó; nếu có charge accrual định kỳ thì chuyển để xử lý.",
          "Bước 6: Cập nhật thông tin lịch thanh toán kỳ tiếp theo và lịch activity nếu không phải kỳ closure."
        ],
        flow: [
          "Đọc và ghi AA.BILL.DETAILS.",
          "Cập nhật AA.ACCOUNT.DETAILS ở bước payment details.",
          "Tạo bill-wise interest accrual và handoff charge accrual.",
          "Cập nhật AA.SCHEDULED.ACTIVITY cho kỳ tiếp theo."
        ]
      },
      {
        name: "CAPITALISE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.CAPITALISE.b",
        summary: "Xử lý capitalise bill: thay vì yêu cầu khách trả tiền, cộng số tiền đến hạn vào gốc của arrangement.",
        steps: [
          "Bước 1: Xác định ngày thanh toán cuối, kiểm tra projected capitalise online và đảm bảo bill sẵn sàng.",
          "Bước 2: Lấy bill CAPITALISE và các bill liên quan, đọc chi tiết và tính số tiền capitalise hoặc due theo từng property.",
          "Bước 3: Với projected bill hoặc online capitalise, xử lý theo nhánh riêng để tránh ghi trùng bill thực tế.",
          "Bước 4: Khi xóa hoặc reverse: đọc lại bill đã capitalise, khôi phục chi tiết thanh toán, trạng thái settle và số tiền cũ trên bill.",
          "Bước 5: Nếu có charge định kỳ đi kèm capitalise, chuyển để xử lý charge accrual tương ứng.",
          "Bước 6: Cập nhật lịch kỳ tiếp theo và AA.SCHEDULED.ACTIVITY sau khi xử lý bill xong."
        ],
        flow: [
          "Đọc và ghi AA.BILL.DETAILS.",
          "Cập nhật AA.ACCOUNT.DETAILS và trạng thái settle khi reverse hoặc capitalise hoàn tất.",
          "Cập nhật projected capitalise data và AA.SCHEDULED.ACTIVITY."
        ]
      }
    ]
  },

  "term-amount": {
    actions: [
      {
        name: "DRAW TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.DRAW.b",
        summary: "Thực hiện giải ngân từ hạn mức commitment: kiểm tra khả dụng, cập nhật hạn mức/utilisation nếu cấu hình cho phép và ghi nhận bút toán kế toán tương ứng.",
        steps: [
          "Bước 1: Đọc thông tin arrangement, tài khoản liên kết, ngày hiệu lực và action hiện tại.",
          "Bước 2: Xác định balance type thực tế của term amount (commitment tổng).",
          "Bước 3: Đọc số tiền giải ngân, kiểm tra xem giải ngân có làm vượt commitment không; kiểm tra cấu hình UPDATE.COMMT.LIMIT và UPDATE.UTILISATION để quyết định có cập nhật facility commitment/utilisation hay không.",
          "Bước 4: Dựng bút toán kế toán với số tiền, chiều giao dịch, balance type, ngày giá trị và chỉ báo reversal.",
          "Bước 5: Đẩy bút toán vào hệ thống kế toán.",
          "Bước 6: Nếu arrangement có participant, cập nhật commitment maturity date, utilisation và xử lý phần pro-rata của từng participant."
        ],
        flow: [
          "Đọc TERM.AMOUNT record, AAA và balance name của property.",
          "Đẩy bút toán kế toán qua accounting manager.",
          "Cập nhật facility commitment và limit APIs khi cấu hình yêu cầu."
        ]
      },
      {
        name: "REDEEM TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.REDEEM.b",
        summary: "Xử lý tất toán term amount (ví dụ: tất toán tiền gửi trước hạn) bằng cách đảo số dư commitment/principal ra khỏi arrangement.",
        steps: [
          "Bước 1: Đọc trạng thái activity, action, ngày hiệu lực và tài khoản liên kết.",
          "Bước 2: Xác định balance type của commitment/term amount hiện tại.",
          "Bước 3: Đọc số tiền cần tất toán từ bản ghi input.",
          "Bước 4: Dựng bút toán kế toán debit với số tiền tất toán, balance type và ngày giá trị.",
          "Bước 5: Đẩy bút toán vào hệ thống kế toán để ghi nhận tất toán."
        ],
        flow: [
          "Không cập nhật bill hay account details trực tiếp.",
          "Trọng tâm là dựng bút toán cho movement amount của TERM.AMOUNT."
        ]
      },
      {
        name: "UPDATE TERM.AMOUNT",
        routine: "AA.TERM.AMOUNT.UPDATE.b",
        summary: "Cập nhật lịch trình quan trọng khi thông tin term amount thay đổi: maturity date, cancel period, tranche schedule và commitment schedule.",
        steps: [
          "Bước 1: Đọc các thông tin thay đổi: MATURITY.DATE, CANCEL.PERIOD, cấu hình tranche và commitment type.",
          "Bước 2: Cập nhật lịch activity của arrangement — cycle hoặc điều chỉnh các activity mature/cancel liên quan.",
          "Bước 3: Ghi maturity date, cancel date hoặc expiry date vào AA.ACCOUNT.DETAILS.",
          "Bước 4: Nếu có cấu hình tranche, đồng bộ lịch giải ngân tranche tương ứng.",
          "Bước 5: Nếu có commitment schedule hoặc unavailability schedule, cập nhật các lịch đó.",
          "Bước 6: Khi xóa hoặc reverse: lấy lại giá trị cũ của maturity date và hoàn nguyên tất cả schedule và account details về trạng thái trước."
        ],
        flow: [
          "Ghi AA.SCHEDULED.ACTIVITY cho mature/cancel activities.",
          "Ghi AA.ACCOUNT.DETAILS cho maturity/cancel/expiry data.",
          "Cập nhật commitment schedule manager."
        ]
      }
    ]
  },

  interest: {
    actions: [
      {
        name: "ACCRUE INTEREST",
        routine: "AA.INTEREST.ACCRUE.b / AA.ACCRUE.INTEREST.b",
        summary: "Tính và tích luỹ lãi suất hàng ngày: xác định kỳ tính lãi, gọi engine tính lãi, dựng bút toán accrual/suspend và cập nhật bản ghi accrual.",
        steps: [
          "Bước 1: Đọc cờ SUPPRESS.ACCRUAL, chế độ kế toán (ACCOUNTING.MODE), bản ghi accrual hiện tại và xác định subtype cần xử lý.",
          "Bước 2: Xác định kỳ tính lãi (ngày bắt đầu, kết thúc, ngày accrue đến); các nhánh payoff, make due, apply payment, suspend, adjust balance có logic ngày riêng.",
          "Bước 3: Gọi engine tính lãi với thông tin arrangement, sản phẩm, accrual rule, số dư gốc và thông tin lịch thanh toán để tính số tiền lãi kỳ này, tháng trước và năm trước.",
          "Bước 4: Nhận kết quả lãi tính toán (committed interest) và ánh xạ vào bản ghi accrual.",
          "Bước 5: Dựng sự kiện kế toán accrual hoặc suspend interest và đẩy vào hệ thống kế toán.",
          "Bước 6: Cập nhật bản ghi AA.INTEREST.ACCRUALS; nếu lãi được theo dõi theo bill (ACCRUAL.TYPE = BILLS) thì cập nhật thêm bill-wise accrual."
        ],
        flow: [
          "Đọc AA.INTEREST.ACCRUALS, AA.ARRANGEMENT, số dư gốc và thông tin bill.",
          "Ghi AA.INTEREST.ACCRUALS qua interest accrual updater.",
          "Cập nhật bill-wise accrual nếu cấu hình BILLS.",
          "Ghi bút toán kế toán qua accounting manager."
        ]
      },
      {
        name: "UPDATE INTEREST",
        routine: "AA.INTEREST.UPDATE.b / AA.INTEREST.COMMON.PROCESSING.b",
        summary: "Tính lại lãi suất hiệu dụng (effective rate), cập nhật interest key trong accrual record và lên lịch reset lãi suất cho các loại floating/periodic.",
        steps: [
          "Bước 1: Xác định property, tiền tệ, product line và các cấu hình đặc biệt (accrual theo bill, forward-dated).",
          "Bước 2: Dựa trên loại activity và cờ RECALCULATE, tính lại EFFECTIVE.RATE (áp dụng index thị trường, margin, cap/floor, negative rate rule) và ghi vào bản ghi.",
          "Bước 3: Nếu custom rate được dùng mà EFFECTIVE.RATE vẫn rỗng, báo lỗi ngay.",
          "Bước 4: Cập nhật bản ghi accrual với interest key mới, chế độ ADVANCE hoặc cờ accrual theo bill.",
          "Bước 5: Nếu có FLOATING.INDEX, tính ngày reset tiếp theo và cập nhật lịch activity CHANGE hoặc APPLY.RATE.",
          "Bước 6: Nếu có PERIODIC.INDEX hoặc PERIODIC.RESET, tính ngày reset periodic tiếp theo và cập nhật AA.SCHEDULED.ACTIVITY."
        ],
        flow: [
          "Ghi EFFECTIVE.RATE lên bản ghi input.",
          "Cập nhật AA.INTEREST.ACCRUALS với interest key mới.",
          "Cập nhật AA.SCHEDULED.ACTIVITY cho lịch reset lãi suất."
        ]
      },
      {
        name: "MAKE.DUE INTEREST",
        routine: "AA.INTEREST.MAKE.DUE.b",
        summary: "Chuyển lãi đã tích luỹ sang trạng thái đến hạn (due): phát sinh bút toán ACC→DUE, xử lý residual/minimum interest và cycle sang kỳ accrual mới.",
        steps: [
          "Bước 1: Đọc bản ghi accrual hiện tại, xác định cờ ADVANCE.FLAG, residual process flag, alternate-interest và nhánh closure hoặc payoff.",
          "Bước 2: Lấy bill PAYMENT của kỳ này và duyệt các bill có chứa property interest.",
          "Bước 3: Trên từng bill, đọc số tiền DUE, WAIVE, SUSPEND; nếu là negative interest thì đảo dấu.",
          "Bước 4: Xác định cặp balance kế toán theo loại bill và chế độ: thường thì DUE↔ACC; mode ADVANCE hoặc UPFRONT.PROFIT có cặp balance riêng (DEF, REC, PAY, ...SP).",
          "Bước 5: Nếu có residual accrual hoặc minimum interest, tính toán và dựng thêm sự kiện điều chỉnh.",
          "Bước 6: Đẩy bút toán vào hệ thống kế toán, sau đó cycle kỳ accrual và cập nhật bản ghi accrual với số tiền due mới."
        ],
        flow: [
          "Đọc AA.BILL.DETAILS và AA.INTEREST.ACCRUALS.",
          "Ghi bút toán kế toán qua accounting manager.",
          "Cập nhật AA.INTEREST.ACCRUALS qua interest period và accrual updater."
        ]
      }
    ]
  },

  closure: {
    actions: [
      {
        name: "CLOSE CLOSURE",
        routine: "AA.CLOSURE.CLOSE.b",
        summary: "Thực thi đóng arrangement: kiểm tra toàn bộ khoản nợ đã được thanh toán, tạo bản ghi ACCOUNT.CLOSURE, xử lý các liên kết settlement/beneficiary và kích hoạt flow mature nếu còn commitment.",
        steps: [
          "Bước 1: Xác định số tài khoản ngân hàng thực của arrangement.",
          "Bước 2: Tính toán số tiền còn DUE; nếu đóng tài khoản trực tiếp thì kiểm tra thêm các liên kết trên tài khoản.",
          "Bước 3: Nếu được phép đóng, cập nhật bản ghi ACCOUNT.CLOSURE với lý do đóng, ghi chú, posting restriction và cờ online closure.",
          "Bước 4: Tại bước input: nếu không cần duyệt (zero-auth) và không có override chờ xử lý, tạo bản ghi ACCOUNT.CLOSURE; tại bước authorize cũng có thể tạo hoặc reverse bản ghi tương ứng.",
          "Bước 5: Khi duyệt: cập nhật settlement block closure, duy trì liên kết beneficiary, cập nhật CRA và xử lý hierarchy/dormancy handoff.",
          "Bước 6: Nếu arrangement còn commitment hoặc là external financial arrangement, kích hoạt secondary activity MATURE; với facility master còn tạo thêm activity đặc thù."
        ],
        flow: [
          "Đọc trạng thái arrangement và các khoản due.",
          "Ghi ACCOUNT.CLOSURE record.",
          "Xử lý liên kết beneficiary, bundle hierarchy và dormancy handoff."
        ]
      },
      {
        name: "EVALUATE CLOSURE",
        routine: "AA.CLOSURE.EVALUATE.b",
        summary: "Đánh giá điều kiện để schedule hoặc kích hoạt activity đóng arrangement — kiểm tra queue, trạng thái dues, defer-closure date và phương thức đóng.",
        steps: [
          "Bước 1: Đọc AA.ACCOUNT.DETAILS, activity class, loại initiation, cờ payoff-processing và ngày defer closure.",
          "Bước 2: Kiểm tra trạng thái queue: nếu queue còn lệnh RECALCULATE, DISCOUNT.MAKEDUE hoặc ISSUE.ORDER chưa xử lý thì dừng, không evaluate closure.",
          "Bước 3: Kiểm tra các điều kiện hạn chế closure: với khoản vay kỹ thuật/gốc, phải đủ điều kiện mới tiếp tục.",
          "Bước 4: Nếu có DeferClosureDate và ngày hiệu lực hiện tại còn nhỏ hơn ngày đó, dừng hoàn toàn không xử lý.",
          "Bước 5: Khi tất cả điều kiện đều thỏa mãn, cập nhật lịch activity CLOSE-ARRANGEMENT; với CLOSURE.METHOD = MANUAL, xử lý theo nhánh riêng cho accounts."
        ],
        flow: [
          "Đọc AA.ACCOUNT.DETAILS và trạng thái queue/arrangement.",
          "Cập nhật AA.SCHEDULED.ACTIVITY của close arrangement khi đủ điều kiện."
        ]
      },
      {
        name: "UPDATE.GUARD CLOSURE",
        routine: "AA.CLOSURE.UPDATE.GUARD.b",
        summary: "Guard quyết định khi nào UPDATE CLOSURE thực sự được kích hoạt — ngăn update không cần thiết khi base-date/start-date chưa thay đổi.",
        steps: [
          "Bước 1: Nhận activity class, property, action và ngày hiệu lực hiện tại.",
          "Bước 2: Kiểm tra xem các activity như disburse hoặc auto-disburse có thực sự cần update closure hay không.",
          "Bước 3: Nếu điều kiện guard chưa thỏa (base-date/start-date chưa thay đổi), chặn việc trigger update closure."
        ],
        flow: [
          "Routine guard, không phải nơi ghi nghiệp vụ closure."
        ]
      },
      {
        name: "UPDATE CLOSURE",
        routine: "AA.CLOSURE.UPDATE.b",
        summary: "Ghi nhận thay đổi cấu hình closure khi điều kiện đóng arrangement thay đổi (CLOSURE.TYPE, CLOSURE.METHOD, cooling period...).",
        steps: [
          "Bước 1: Lấy context activity hiện tại.",
          "Bước 2: Ghi nhận thay đổi condition của property closure.",
          "Bước 3: Xử lý lỗi và ghi log."
        ],
        flow: [
          "Routine cập nhật condition, không phải routine thực thi đóng tài khoản."
        ]
      }
    ]
  },

  "payout-rules": {
    actions: [
      {
        name: "ALLOCATE PAYOUT.RULES",
        routine: "AA.PAYOUT.RULES.ALLOCATE.b",
        summary: "Phân bổ số tiền payout ra ngoài (ví dụ: trả lãi tiết kiệm) vào đúng bill/property theo thứ tự ưu tiên, cập nhật payment amount trên bill và tạo secondary activity cho phần dư hoặc auto-disbursement.",
        steps: [
          "Bước 1: Lấy số tiền payout, tỷ giá và loại tiền từ activity hiện tại; khi reverse/delete dùng số tiền gốc của giao dịch.",
          "Bước 2: Đọc APPLICATION.TYPE và APPLICATION.ORDER, phân bổ số tiền vào từng bill/property theo thứ tự ưu tiên — xác định bill nào nhận bao nhiêu, property nào được trả, số tiền dư còn lại.",
          "Bước 3: Nếu bill đã có payout amount, cập nhật payment amount trên bill.",
          "Bước 4: Nếu còn tiền dư sau phân bổ, tạo secondary activity để xử lý phần dư theo REMAINDER.ACTIVITY.",
          "Bước 5: Nếu cần auto-disbursement (tự động giải ngân), tạo thêm secondary activity AUTO.DISBURSE; khi reverse, đảo ngược payment amount trên các bill đã xử lý."
        ],
        flow: [
          "Đọc thông tin activity hiện tại và danh sách bill.",
          "Cập nhật AA.BILL.DETAILS qua payout bill payment amount manager.",
          "Tạo secondary activity cho phần dư và auto-disbursement."
        ]
      },
      {
        name: "UPDATE PAYOUT.RULES",
        routine: "AA.PAYOUT.RULES.UPDATE.b",
        summary: "Ghi nhận thay đổi cấu hình quy tắc payout khi thứ tự phân bổ hoặc property đích thay đổi.",
        steps: [
          "Bước 1: Lấy context activity.",
          "Bước 2: Ghi nhận thay đổi condition cho property payout rules.",
          "Bước 3: Xử lý lỗi và ghi log."
        ],
        flow: [
          "Routine cập nhật condition, không phải routine thực thi phân bổ payout."
        ]
      }
    ]
  }
};

export type ActionPatchKey = keyof typeof actionPatches;
