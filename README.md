ww.js



1.	Studio：工作室类，主要负责Camera，Light和Background对象的创建并保有对它们的引用。其中Camera类用于控制摄像机，Light用于设定并且控制光源，Background用于设置背景（它又包括了对地面和空中背景的设定），这三个对象是构建整个场景的基础。其他所有实体对象都派生于Object类，这些对象也都被包含在Studio中。
