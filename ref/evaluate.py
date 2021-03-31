#!/usr/bin/python
# coding=utf-8

import json


def formatter(_data, _meta):
    """
    将数据转换成用于提交和评分的格式。
    :param _data:
    参考数据集中 [x]-[set]-with-answer.json 文件的格式，
    用参赛系统给 [x]-[dev/test].json 中读出的对象列表添加 judge1 或/和 judge2 字段，
    然后直接将添加了答案字段的三个任务dev集（或test集）中的所有数据全都放在一个 List 里，构成此参数。
    :param _meta: 参赛队伍的关键信息，用来呈现在排行榜。
    :return: 符合用于提交和评分的格式的数据，称之为"答卷"。
    """
    _sheet = {'meta': {
        'team_name': _meta['team_name'],  # 队伍名称
        'institution': _meta['institution'],  # 机构（简称）
        'email': _meta['email'],  # 联系邮箱
    }}
    _methods = {
        '1': lambda _item: int(_item['judge1']),
        '2': lambda _item: int(_item['judge2']),
        '3': lambda _item: [int(_item['judge1']), int(_item['judge2'])],
    }
    for _item in _data:
        _task_id, _set_type, _item_id = _item['qID'].split('-')
        _key = f"subtask{_task_id}-{_set_type}"
        if (_set_type == 'dev' or _set_type == 'val' or _set_type == 'test') and _key not in _sheet:
            _sheet[_key] = {}
        _sheet[_key][_item_id] = _methods[_task_id](_item)
    # print(_sheet)
    # print(json.dumps(_sheet, ensure_ascii=False))
    return json.dumps(_sheet)


def subtask1_eval(_answers, _ref):
    """
    子任务1的评分函数。
    :param _answers: 答卷答案。
    :param _ref: 参考答案。
    :return: 统计数据对象。
    """
    _map = {
        '11': 'TP',
        '00': 'TN',
        '10': 'FN',
        '01': 'FP',
    }
    _st = {
        'TP': 0,
        'TN': 0,
        'FN': 0,
        'FP': 0,
    }
    for _k, _v in _ref.items():
        _ga = int(_v)
        _aa = int(_answers[_k]) if _k in _answers else 0
        _st[_map[f"{_ga}{_aa}"]] += 1
    _st['Accuracy'] = (_st['TP'] + _st['TN']) / (_st['TP'] + _st['FP'] + _st['FN'] + _st['TN'])
    return _st


def subtask2_eval(_answers, _ref):
    """
    子任务2的评分函数，与子任务1算法一致。
    :param _answers: 答卷答案。
    :param _ref: 参考答案。
    :return: 统计数据对象。
    """
    return subtask1_eval(_answers, _ref)


def subtask3_eval(_answers, _ref):
    """
    子任务3的评分函数。
    :param _answers: 答卷答案。
    :param _ref: 参考答案。
    :return: 统计数据对象。
    """
    _map_1 = {
        '11': 'TP_1',
        '00': 'TN_1',
        '10': 'FN_1',
        '01': 'FP_1',
    }
    _map_2 = {
        '11': 'TP_2',
        '00': 'TN_2',
        # '10': 'FN_2',
        # '01': 'FP_2',
    }
    _st = {
        'TP_1': 0,
        'TN_1': 0,
        'FN_1': 0,
        'FP_1': 0,
        'TP_2': 0,
        'TN_2': 0,
        # 'FN_2': 0,
        # 'FP_2': 0,
    }
    for _k, _v in _ref.items():
        _ga = int(_v[0])
        _aa = int(_answers[_k][0]) if _k in _answers else 0
        _st[_map_1[f"{_ga}{_aa}"]] += 1
        _gb = int(_v[1])
        _ab = int(_answers[_k][1]) if _k in _answers else 0
        if _aa == 0 == _ga and _gb == _ab:
            _st[_map_2[f"{_gb}{_ab}"]] += 1
    _st['Precision'] = (_st['TP_2'] + _st['TN_2']) / (_st['TN_1'] + _st['FN_1']) \
        if (_st['TN_1'] + _st['FN_1']) != 0 else 0
    _st['Recall'] = (_st['TP_2'] + _st['TN_2']) / (_st['TN_1'] + _st['FP_1']) \
        if (_st['TN_1'] + _st['FP_1']) != 0 else 0
    _st['F1'] = 2 * _st['Precision'] * _st['Recall'] / (_st['Precision'] + _st['Recall']) \
        if (_st['Precision'] + _st['Recall']) != 0 else 0
    return _st


def evaluate(_sheet, _ref1, _ref2, _ref3):
    _result = {
        'meta': _sheet['meta'],
        'subtask1': subtask1_eval(_sheet['subtask1-dev'], _ref1),
        'subtask2': subtask2_eval(_sheet['subtask2-dev'], _ref2),
        'subtask3': subtask3_eval(_sheet['subtask3-dev'], _ref3),
    }
    return _result


if __name__ == '__main__':
    #
    dev_or_test = 'dev'  # or 'test'
    meta = {
        'team_name': "某某队",  # 队伍名称
        'institution': "某某大学",  # 机构（简称）
        'email': "example@website.com",  # 联系邮箱
    }
    #
    my_path_1 = f'/YOUR/PATH/OF/task1-{dev_or_test}-with-answer.json'
    my_path_2 = f'/YOUR/PATH/OF/task2-{dev_or_test}-with-answer.json'
    my_path_3 = f'/YOUR/PATH/OF/task3-{dev_or_test}-with-answer.json'
    answers = []
    for path in [my_path_1, my_path_2, my_path_3]:
        with open(path, 'r', encoding='utf-8') as f:
            task_answers = json.loads(f.read())
            answers += task_answers
    sheet = json.loads(formatter(answers, meta))
    #
    ref_path_1 = f'/PATH/OF/task1-{dev_or_test}-with-answer.json'
    ref_path_2 = f'/PATH/OF/task2-{dev_or_test}-with-answer.json'
    ref_path_3 = f'/PATH/OF/task3-{dev_or_test}-with-answer.json'
    answers = []
    for path in [ref_path_1, ref_path_2, ref_path_3]:
        with open(path, 'r', encoding='utf-8') as f:
            task_answers = json.loads(f.read())
            answers += task_answers
    refs = json.loads(formatter(answers, meta))
    #
    that = evaluate(sheet, refs[f'subtask1-{dev_or_test}'], refs[f'subtask2-{dev_or_test}'], refs[f'subtask3-{dev_or_test}'])
    print(that)
    pass
