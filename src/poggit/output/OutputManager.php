<?php

/*
 * Copyright 2016 poggit
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace poggit\output;

use function poggit\getLog;

class OutputManager {
    public static $current;

    /** @var OutputManager|null */
    private $parent;
    /** @var OutputManager|null */
    private $child = null;

    /** @var string */
    private $buffer = "";

    public function __construct(OutputManager $parent = null) {
        $this->parent = $parent;
        self::$current = $this;

        if($parent === null) {
            ob_start([$this, "handle"]);
        }
    }

    public function startChild() : OutputManager {
        $this->child = new OutputManager($this);
        return $this->child;
    }

    public function handle(string $buffer) {
        if($this->child !== null) {
            $this->child->handle($buffer);
        }
        $this->append($buffer);
    }

    public function flush() {
        if($this->parent === null) {
            ob_end_clean();
            echo $this->buffer;
            ob_start([$this, "handle"]);
        } else {
            $this->parent->append($this->buffer);
        }
        $this->buffer = "";
    }

    public function output() {
        if($this->parent === null) {
            if(ob_get_length()) ob_end_clean();
            echo $this->buffer;
        } else {
            $this->parent->closeChild($this->buffer);
        }
    }

    public function terminate() {
        if($this->parent === null) {
            if(ob_get_length()) ob_end_clean();
        } else {
            $this->parent->closeChild("");
        }
    }

    protected function closeChild(string $buffer) {
        $this->append($buffer);
        $this->child = null;
    }

    protected function append($buffer) {
        $this->buffer .= $buffer;
    }
}