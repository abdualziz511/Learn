<?php
// core/Validator.php
// Input validation & sanitization

declare(strict_types=1);

namespace Core;

class Validator
{
    private array $errors = [];
    private array $data   = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    // -------------------------------------------------------
    // Static entry point
    // -------------------------------------------------------
    public static function make(array $data, array $rules): self
    {
        $v = new self($data);
        $v->validate($rules);
        return $v;
    }

    // -------------------------------------------------------
    // Run validation rules
    // -------------------------------------------------------
    private function validate(array $rules): void
    {
        foreach ($rules as $field => $ruleStr) {
            $ruleList = explode('|', $ruleStr);
            $value    = $this->data[$field] ?? null;

            $isNullable = in_array('nullable', $ruleList);
            $isRequired = in_array('required', $ruleList);

            // Skip validation if value is empty and (not required OR is nullable)
            if (($value === null || $value === '') && !$isRequired) {
                continue;
            }

            foreach ($ruleList as $rule) {
                [$ruleName, $param] = array_pad(explode(':', $rule, 2), 2, null);

                if ($ruleName === 'nullable') continue;

                $pass = match ($ruleName) {
                    'required'  => $this->ruleRequired($value),
                    'string'    => $value === null || is_string($value),
                    'integer'   => $value === null || filter_var($value, FILTER_VALIDATE_INT) !== false,
                    'numeric'   => $value === null || is_numeric($value),
                    'email'     => $value === null || filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
                    'min'       => $value === null || (is_string($value) ? mb_strlen($value) >= (int)$param : $value >= (float)$param),
                    'max'       => $value === null || (is_string($value) ? mb_strlen($value) <= (int)$param : $value <= (float)$param),
                    'in'        => $value === null || in_array($value, explode(',', $param ?? ''), true),
                    'date'      => $value === null || $this->ruleDate($value),
                    'phone'     => $value === null || $this->rulePhone($value),
                    'confirmed' => $value === null || $value === ($this->data[$field . '_confirmation'] ?? null),
                    'nullable'  => true,
                    'boolean'   => $value === null || in_array($value, [true, false, 0, 1, '0', '1'], true),
                    'array'     => $value === null || is_array($value),
                    'url'       => $value === null || filter_var($value, FILTER_VALIDATE_URL) !== false,
                    default     => true,
                };

                if (!$pass) {
                    $this->errors[$field][] = $this->message($ruleName, $field, $param);
                    break; // stop on first failure per field
                }
            }
        }
    }

    // -------------------------------------------------------
    // Rule helpers
    // -------------------------------------------------------
    private function ruleRequired(mixed $value): bool
    {
        if ($value === null || $value === '') return false;
        if (is_array($value) && empty($value)) return false;
        return true;
    }

    private function ruleDate(mixed $value): bool
    {
        if (!is_string($value)) return false;
        $d = \DateTime::createFromFormat('Y-m-d', $value);
        return $d && $d->format('Y-m-d') === $value;
    }

    private function rulePhone(mixed $value): bool
    {
        return (bool)preg_match('/^\+?[0-9\s\-]{7,20}$/', (string)$value);
    }

    private function message(string $rule, string $field, ?string $param): string
    {
        $label = str_replace('_', ' ', $field);
        return match ($rule) {
            'required'  => "حقل {$label} مطلوب",
            'email'     => "حقل {$label} يجب أن يكون بريداً إلكترونياً صحيحاً",
            'min'       => "حقل {$label} يجب أن لا يقل عن {$param}",
            'max'       => "حقل {$label} يجب أن لا يتجاوز {$param}",
            'integer'   => "حقل {$label} يجب أن يكون رقماً صحيحاً",
            'numeric'   => "حقل {$label} يجب أن يكون رقماً",
            'in'        => "قيمة {$label} غير مقبولة",
            'date'      => "حقل {$label} يجب أن يكون تاريخاً بصيغة YYYY-MM-DD",
            'phone'     => "حقل {$label} يجب أن يكون رقم هاتف صحيحاً",
            'confirmed' => "حقل {$label} والتأكيد غير متطابقان",
            'boolean'   => "حقل {$label} يجب أن يكون true أو false",
            'array'     => "حقل {$label} يجب أن يكون مصفوفة",
            'url'       => "حقل {$label} يجب أن يكون رابطاً صحيحاً",
            default     => "حقل {$label} غير صحيح",
        };
    }

    // -------------------------------------------------------
    // Public API
    // -------------------------------------------------------
    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function failAndRespond(): void
    {
        if ($this->fails()) {
            Response::validationError($this->errors);
        }
    }

    // -------------------------------------------------------
    // Sanitize a string value
    // -------------------------------------------------------
    public static function sanitizeString(mixed $value): string
    {
        return htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');
    }

    // -------------------------------------------------------
    // Get validated value (sanitized)
    // -------------------------------------------------------
    public function validated(): array
    {
        return array_map(
            function($v) {
                if ($v === null) return null;
                if (!is_string($v)) return $v;
                $cleaned = self::sanitizeString($v);
                return $cleaned === '' ? null : $cleaned;
            },
            $this->data
        );
    }
}
